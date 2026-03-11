import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  ChatBubble,
  Phone,
  AccountCircle,
  MoreVert,
  Send,
  Mic,
  InsertDriveFile,
  PlayCircleFilled,
  Stop,
  InsertEmoticon,
  Attachment,
  Call,
  VideoCall,
  Email,
  Info
} from '@mui/icons-material';

import { ChatBubble as ChatBubbleComponent } from '../components/ChatBubble';
import { ChatInput } from '../components/ChatInput';

export const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioInput, setAudioInput] = useState<any>(null);
  const [fileInput, setFileInput] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // Simulate fetching conversation data
        const mockConversation = {
          id: 'conv-1',
          business: {
            name: 'Acme Corporation',
            industry: 'Technology',
            logo: ''
          },
          customer: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            avatar: ''
          },
          channel: 'Chat',
          status: 'Open',
          metadata: {
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          }
        };

        const mockMessages = [
          {
            id: 'msg-1',
            sender: 'AI',
            content: 'Hello! How can I help you today?',
            contentType: 'TEXT',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            id: 'msg-2',
            sender: 'HUMAN',
            content: 'I\'m interested in your services. Can you tell me more about pricing?',
            contentType: 'TEXT',
            timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
          },
          {
            id: 'msg-3',
            sender: 'AI',
            content: 'Sure! Our pricing starts at $99/month for basic features. Would you like a demo?',
            contentType: 'TEXT',
            timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
          },
          {
            id: 'msg-4',
            sender: 'HUMAN',
            content: 'Yes, that would be great!',
            contentType: 'TEXT',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        ];

        setConversation(mockConversation);
        setMessages(mockMessages);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setSendingMessage(true);

    try {
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: 'HUMAN',
        content,
        contentType: 'TEXT',
        timestamp: new Date().toISOString(),
        status: 'SENDING'
      };

      // Add message to state
      setMessages(prev => [...prev, newMessage]);

      // Simulate sending message
      setTimeout(() => {
        const updatedMessage = {
          ...newMessage,
          status: 'SENT'
        };
        setMessages(prev => prev.map(m => m.id === newMessage.id ? updatedMessage : m));
      }, 1000);

      // In a real app, you would send this to the server
      // socket.emit('message', { conversationId: id, message: content });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => m.id === `msg-${Date.now()}` ? { ...m, status: 'ERROR' } : m));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendVoiceMessage = async (audioData: Blob) => {
    try {
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: 'HUMAN',
        content: 'Voice message',
        contentType: 'VOICE',
        timestamp: new Date().toISOString(),
        status: 'SENDING',
        metadata: {
          fileName: 'voice_message.wav',
          fileSize: audioData.size
        }
      };

      setMessages(prev => [...prev, newMessage]);

      // Simulate processing voice message
      setTimeout(() => {
        const updatedMessage = {
          ...newMessage,
          status: 'SENT'
        };
        setMessages(prev => prev.map(m => m.id === newMessage.id ? updatedMessage : m));
      }, 2000);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleSendFile = async (file: File) => {
    try {
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: 'HUMAN',
        content: 'File attachment',
        contentType: 'FILE',
        timestamp: new Date().toISOString(),
        status: 'SENDING',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      };

      setMessages(prev => [...prev, newMessage]);

      // Simulate file upload
      setTimeout(() => {
        const updatedMessage = {
          ...newMessage,
          status: 'SENT'
        };
        setMessages(prev => prev.map(m => m.id === newMessage.id ? updatedMessage : m));
      }, 3000);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleResendMessage = (messageId: string) => {
    // Find the message and resend it
    const message = messages.find(m => m.id === messageId);
    if (message && message.status === 'ERROR') {
      // Update status to SENDING
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, status: 'SENDING' }
            : m
        )
      );

      // Simulate resending
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, status: 'SENT' }
              : m
          )
        );
      }, 1000);
    }
  };

  const handleDownloadFile = (message: any) => {
    console.log('Download file:', message.metadata);
    // In a real app, you would trigger a file download
  };

  const handlePlayVoiceMessage = (message: any) => {
    console.log('Play voice message:', message);
    // In a real app, you would play the audio
  };

  const handleRecordVoiceMessage = () => {
    setRecording(!recording);
    console.log('Voice recording:', recording ? 'stopped' : 'started');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTransferToAgent = () => {
    console.log('Transferring to agent...');
    // In a real app, you would transfer the conversation to a human agent
    handleMenuClose();
  };

  const handleEndConversation = () => {
    console.log('Ending conversation...');
    // In a real app, you would end the conversation
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Conversation...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Conversation not found</Typography>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 48, height: 48 }}>
            {conversation.customer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              {conversation.customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversation.channel} conversation
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={conversation.status}
            size="small"
            color={conversation.status === 'Open' ? 'success' : 'warning'}
          />
          <IconButton size="large" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleTransferToAgent}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Transfer to Agent
            </MenuItem>
            <MenuItem onClick={handleEndConversation}>
              <ListItemIcon>
                <Call fontSize="small" />
              </ListItemIcon>
              End Conversation
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        flex={1}
        overflow="auto"
        maxHeight="60vh"
        mb={3}
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) => `${theme.palette.primary?.light} ${theme.palette.background?.paper}`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.light',
            borderRadius: '3px',
          },
        }}
      >
        {messages.map((message) => (
          <Box key={message.id} mb={2}>
            <ChatBubbleComponent
              message={message}
              isOwnMessage={message.sender === 'HUMAN'}
              onResend={handleResendMessage}
              onDownload={handleDownloadFile}
              onPlay={handlePlayVoiceMessage}
            />
          </Box>
        ))}
      </Box>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onVoiceMessage={handleSendVoiceMessage}
        onFileUpload={handleSendFile}
        disabled={!isConnected}
      />
    </Box>
  );
};