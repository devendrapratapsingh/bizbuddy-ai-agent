import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send,
  Check,
  CheckCircle,
  Error,
  Schedule,
  InsertDriveFile,
  PlayCircleFilled,
  Mic,
  GetApp
} from '@mui/icons-material';

interface ChatBubbleProps {
  message: {
    id: string;
    sender: 'AI' | 'HUMAN' | 'SYSTEM';
    content: string;
    contentType: 'TEXT' | 'VOICE' | 'IMAGE' | 'FILE';
    status?: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'ERROR';
    timestamp: Date;
    metadata?: any;
  };
  isOwnMessage: boolean;
  onResend?: (messageId: string) => void;
  onDownload?: (message: any) => void;
  onPlay?: (message: any) => void;
  onRecord?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwnMessage,
  onResend,
  onDownload,
  onPlay,
  onRecord
}) => {
  const isSystemMessage = message.sender === 'SYSTEM';
  const isVoiceMessage = message.contentType === 'VOICE';
  const isFileMessage = message.contentType === 'FILE';

  const renderMessageContent = () => {
    if (isVoiceMessage) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Mic style={{ fontSize: 20, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            Voice message
          </Typography>
          {onPlay && (
            <Tooltip title="Play voice message">
              <IconButton size="small" onClick={() => onPlay(message)}>
                <PlayCircleFilled />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    }

    if (isFileMessage) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <InsertDriveFile style={{ fontSize: 20, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            {message.metadata?.fileName || 'File'}
          </Typography>
          {onDownload && (
            <Tooltip title="Download file">
              <IconButton size="small" onClick={() => onDownload(message)}>
                <GetApp />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    }

    // Regular text message
    return (
      <Typography variant="body1" color={isSystemMessage ? 'text.secondary' : undefined}>
        {message.content}
      </Typography>
    );
  };

  const renderStatusIndicator = () => {
    if (!isOwnMessage || isSystemMessage) return null;

    const statusIcons = {
      SENDING: <CircularProgress size={16} color="inherit" />,
      SENT: <Check style={{ fontSize: 16, color: '#666' }} />,
      DELIVERED: <CheckCircle style={{ fontSize: 16, color: '#4caf50' }} />,
      READ: <CheckCircle style={{ fontSize: 16, color: '#2196f3' }} />,
      ERROR: (
        <Tooltip title="Message failed to send. Click to retry.">
          <Error
            style={{ fontSize: 16, color: '#f44336' }}
            onClick={() => onResend?.(message.id)}
          />
        </Tooltip>
      )
    };

    return (
      <Box ml={2}>
        {statusIcons[message.status || 'SENT']}
      </Box>
    );
  };

  const renderTimestamp = () => {
    const timeString = new Date(message.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {timeString}
      </Typography>
    );
  };

  if (isSystemMessage) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        maxWidth="80%"
        mx="auto"
        my={1}
      >
        <Box
          bgcolor="background.paper"
          border={1}
          borderColor="divider"
          borderRadius={16}
          p={2}
          boxShadow={1}
        >
          {renderMessageContent()}
        </Box>
        {renderTimestamp()}
      </Box>
    );
  }

  if (isOwnMessage) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        maxWidth="80%"
        my={1}
      >
        <Box
          display="flex"
          alignItems="flex-end"
          gap={1}
        >
          <Box
            bgcolor="#e3f2fd"
            border={1}
            borderColor="#bbdefb"
            borderRadius={16}
            p={2}
            maxWidth="100%"
          >
            {renderMessageContent()}
          </Box>
          <Avatar size="small">U</Avatar>
        </Box>
        <Box display="flex" gap={1} mt={0.5}>
          {renderStatusIndicator()}
          {renderTimestamp()}
        </Box>
      </Box>
    );
  }

  // Other person's message
  return (
    <Box
      display="flex"
      flexDirection="column"
      maxWidth="80%"
      my={1}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1}
      >
        <Avatar size="small">A</Avatar>
        <Box
          bgcolor="background.paper"
          border={1}
          borderColor="divider"
          borderRadius={16}
          p={2}
          maxWidth="100%"
        >
          {renderMessageContent()}
        </Box>
      </Box>
      {renderTimestamp()}
    </Box>
  );
};