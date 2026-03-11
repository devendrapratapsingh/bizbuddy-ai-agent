import { prisma } from '@/config/database';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class VoiceService {
  private static instance: VoiceService;
  private io: Server | null = null;
  private activeCalls: Map<string, any> = new Map();
  private recordingSessions: Map<string, any> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  initialize(io: Server) {
    this.io = io;
    this.setupSocketEvents();
  }

  isInitialized(): boolean {
    return this.io !== null;
  }

  private setupSocketEvents() {
    this.io.of('/voice').on('connection', (socket) => {
      console.log('Voice client connected:', socket.id);

      socket.on('join-call', async (data) => {
        try {
          const { callId, userId } = data;

          // Join the call room
          socket.join(callId);

          // Notify other participants
          socket.to(callId).emit('user-joined', { userId, socketId: socket.id });

          // Send current participants
          const participants = Object.keys(this.io.of('/voice').adapter.rooms.get(callId) || []);
          socket.emit('participants', participants);

          console.log(`User ${userId} joined call ${callId}`);
        } catch (error) {
          console.error('Error joining call:', error);
          socket.emit('error', { message: 'Failed to join call' });
        }
      });

      socket.on('offer', (data) => {
        try {
          const { callId, offer, toSocketId } = data;

          // Forward offer to specific user
          socket.to(toSocketId).emit('offer', {
            offer,
            fromSocketId: socket.id
          });

          console.log(`Forwarded offer from ${socket.id} to ${toSocketId}`);
        } catch (error) {
          console.error('Error forwarding offer:', error);
          socket.emit('error', { message: 'Failed to forward offer' });
        }
      });

      socket.on('answer', (data) => {
        try {
          const { callId, answer, toSocketId } = data;

          // Forward answer to specific user
          socket.to(toSocketId).emit('answer', {
            answer,
            fromSocketId: socket.id
          });

          console.log(`Forwarded answer from ${socket.id} to ${toSocketId}`);
        } catch (error) {
          console.error('Error forwarding answer:', error);
          socket.emit('error', { message: 'Failed to forward answer' });
        }
      });

      socket.on('ice-candidate', (data) => {
        try {
          const { callId, candidate, toSocketId } = data;

          // Forward ICE candidate to specific user
          socket.to(toSocketId).emit('ice-candidate', {
            candidate,
            fromSocketId: socket.id
          });

          console.log(`Forwarded ICE candidate from ${socket.id} to ${toSocketId}`);
        } catch (error) {
          console.error('Error forwarding ICE candidate:', error);
          socket.emit('error', { message: 'Failed to forward ICE candidate' });
        }
      });

      socket.on('start-recording', async (data) => {
        try {
          const { callId, userId } = data;

          // Generate recording ID
          const recordingId = uuidv4();

          // Store recording session
          this.recordingSessions.set(recordingId, {
            callId,
            userId,
            startTime: new Date(),
            participants: [socket.id]
          });

          // Notify all participants about recording
          socket.to(callId).emit('recording-started', { recordingId, startedBy: userId });
          socket.emit('recording-started', { recordingId, startedBy: userId });

          console.log(`Recording started for call ${callId} by user ${userId}`);
        } catch (error) {
          console.error('Error starting recording:', error);
          socket.emit('error', { message: 'Failed to start recording' });
        }
      });

      socket.on('stop-recording', async (data) => {
        try {
          const { callId, recordingId } = data;

          // Get recording session
          const recordingSession = this.recordingSessions.get(recordingId);

          if (recordingSession) {
            // Calculate duration
            const endTime = new Date();
            const duration = endTime.getTime() - recordingSession.startTime.getTime();

            // Save recording to database
            await prisma.conversation.create({
              data: {
                businessId: recordingSession.businessId || 'unknown',
                customerId: recordingSession.customerId || 'unknown',
                channel: 'VOICE',
                status: 'CLOSED',
                context: {
                  recordingId,
                  duration,
                  participants: recordingSession.participants,
                  startTime: recordingSession.startTime,
                  endTime
                }
              }
            });

            // Remove recording session
            this.recordingSessions.delete(recordingId);

            // Notify all participants
            socket.to(callId).emit('recording-stopped', { recordingId, duration });
            socket.emit('recording-stopped', { recordingId, duration });

            console.log(`Recording stopped for call ${callId} - Duration: ${duration}ms`);
          }
        } catch (error) {
          console.error('Error stopping recording:', error);
          socket.emit('error', { message: 'Failed to stop recording' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Voice client disconnected:', socket.id);

        // Notify other participants
        for (const [callId, room] of this.io.of('/voice').adapter.rooms) {
          if (room.has(socket.id)) {
            socket.to(callId).emit('user-left', { socketId: socket.id });
          }
        }
      });
    });
  }

  async initiateCall(
    businessId: string,
    customerId: string,
    customerName: string,
    customerPhone: string
  ) {
    try {
      // Generate unique call ID
      const callId = `call-${Date.now()}-${businessId}`;

      // Create conversation record
      const conversation = await prisma.conversation.create({
        data: {
          businessId,
          customerId,
          channel: 'VOICE',
          status: 'IN_PROGRESS',
          context: {
            callId,
            customerName,
            customerPhone,
            initiatedAt: new Date()
          }
        }
      });

      // Notify business agents about incoming call
      this.io.of('/voice').to(`business-${businessId}`).emit('incoming-call', {
        callId,
        customerId,
        customerName,
        customerPhone,
        conversationId: conversation.id
      });

      return {
        callId,
        conversationId: conversation.id,
        message: `Incoming call from ${customerName} (${customerPhone})`
      };
    } catch (error) {
      console.error('Error initiating call:', error);
      throw new Error('Failed to initiate call');
    }
  }

  async acceptCall(
    conversationId: string,
    agentId: string,
    agentName: string
  ) {
    try {
      // Get conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          context: true
        }
      });

      if (!conversation || conversation.channel !== 'VOICE') {
        throw new Error('Invalid conversation or not a voice call');
      }

      const callId = conversation.context?.callId;

      if (!callId) {
        throw new Error('Call ID not found in conversation context');
      }

      // Notify customer that agent has joined
      this.io.of('/voice').to(callId).emit('agent-joined', {
        agentId,
        agentName
      });

      return {
        message: `Agent ${agentName} has joined the call`,
        participants: this.getParticipants(callId)
      };
    } catch (error) {
      console.error('Error accepting call:', error);
      throw new Error('Failed to accept call');
    }
  }

  async endCall(conversationId: string) {
    try {
      // Get conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!conversation || conversation.channel !== 'VOICE') {
        throw new Error('Invalid conversation or not a voice call');
      }

      // Update conversation status
      const updatedConversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'CLOSED' }
      });

      const callId = conversation.context?.callId;

      if (callId) {
        // Notify all participants that call has ended
        this.io.of('/voice').to(callId).emit('call-ended', {
          conversationId,
          endedAt: new Date()
        });

        // Leave all rooms
        this.io.of('/voice').adapter.remoteLeaveAll(callId);
      }

      return {
        message: 'Call ended successfully',
        conversation: updatedConversation
      };
    } catch (error) {
      console.error('Error ending call:', error);
      throw new Error('Failed to end call');
    }
  }

  async getCallStatus(callId: string) {
    try {
      const room = this.io.of('/voice').adapter.rooms.get(callId);

      return {
        callId,
        isActive: room !== undefined && room.size > 0,
        participantCount: room ? room.size : 0,
        participants: this.getParticipants(callId)
      };
    } catch (error) {
      console.error('Error getting call status:', error);
      throw new Error('Failed to get call status');
    }
  }

  private getParticipants(callId: string): string[] {
    const room = this.io.of('/voice').adapter.rooms.get(callId);
    return room ? Array.from(room) : [];
  }

  async processSpeechToText(audioData: Buffer, language: string = 'en-US') {
    try {
      // This would integrate with a speech-to-text service
      // For now, return a placeholder
      return {
        transcript: 'This is a placeholder transcript from speech-to-text processing',
        confidence: 0.85,
        language,
        duration: 0
      };
    } catch (error) {
      console.error('Error processing speech to text:', error);
      throw new Error('Failed to process speech to text');
    }
  }

  async generateTextToSpeech(text: string, voice: string = 'default') {
    try {
      // This would integrate with a text-to-speech service
      // For now, return a placeholder
      return {
        audioData: Buffer.from(''), // Placeholder audio data
        voice,
        duration: 0
      };
    } catch (error) {
      console.error('Error generating text to speech:', error);
      throw new Error('Failed to generate text to speech');
    }
  }

  async getRecording(recordingId: string) {
    try {
      const recordingSession = this.recordingSessions.get(recordingId);

      if (!recordingSession) {
        throw new Error('Recording not found');
      }

      return recordingSession;
    } catch (error) {
      console.error('Error getting recording:', error);
      throw new Error('Failed to get recording');
    }
  }

  async listActiveCalls() {
    try {
      const activeCalls = [];

      for (const [callId, room] of this.io.of('/voice').adapter.rooms) {
        if (callId.startsWith('call-')) {
          activeCalls.push({
            callId,
            participantCount: room.size,
            participants: Array.from(room),
            startedAt: new Date(parseInt(callId.split('-')[1]))
          });
        }
      }

      return activeCalls;
    } catch (error) {
      console.error('Error listing active calls:', error);
      throw new Error('Failed to list active calls');
    }
  }
}