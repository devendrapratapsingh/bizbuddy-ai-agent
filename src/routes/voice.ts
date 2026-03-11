import { Router } from 'express';
import { VoiceService } from '@/services/voice';

const router = Router();
const voiceService = VoiceService.getInstance();

// Get all active calls
router.get('/active', async (req, res) => {
  try {
    const activeCalls = await voiceService.listActiveCalls();
    res.status(200).json(activeCalls);
  } catch (error) {
    console.error('Error getting active calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initiate a new voice call
router.post('/initiate', async (req, res) => {
  try {
    const { businessId, customerId, customerName, customerPhone } = req.body;

    if (!businessId || !customerId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await voiceService.initiateCall(
      businessId,
      customerId,
      customerName,
      customerPhone
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept an incoming call
router.post('/:callId/accept', async (req, res) => {
  try {
    const { callId } = req.params;
    const { agentId, agentName } = req.body;

    if (!agentId || !agentName) {
      return res.status(400).json({ error: 'Agent ID and name are required' });
    }

    const result = await voiceService.acceptCall(
      callId,
      agentId,
      agentName
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error accepting call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End a call
router.post('/:callId/end', async (req, res) => {
  try {
    const { callId } = req.params;

    const result = await voiceService.endCall(callId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call status
router.get('/:callId/status', async (req, res) => {
  try {
    const { callId } = req.params;

    const status = await voiceService.getCallStatus(callId);

    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting call status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process speech to text
router.post('/speech-to-text', async (req, res) => {
  try {
    const { audioData, language = 'en-US' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const result = await voiceService.processSpeechToText(
      audioData,
      language
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing speech to text:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate text to speech
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'default' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await voiceService.generateTextToSpeech(text, voice);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating text to speech:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recording information
router.get('/recording/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;

    const recording = await voiceService.getRecording(recordingId);

    res.status(200).json(recording);
  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as voiceRouter };