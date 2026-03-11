import React, { useState } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Popover,
  Fade,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  Send,
  Mic,
  InsertDriveFile,
  PlayCircleFilled,
  Stop,
  KeyboardVoice,
  InsertEmoticon,
  Attachment
} from '@mui/icons-material';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceMessage?: (audioData: Blob) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoiceMessage,
  onFileUpload,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLButtonElement | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Here you would stop the audio recording and get the blob
      // For now, simulate with a placeholder
      const mockAudioBlob = new Blob(['placeholder audio data'], { type: 'audio/wav' });
      onVoiceMessage?.(mockAudioBlob);
    } else {
      // Start recording
      setIsRecording(true);
      // Here you would start audio recording
      console.log('Starting voice recording...');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload?.(file);
    }
    setPopoverAnchor(null);
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const open = Boolean(popoverAnchor);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 2, bgcolor: 'background.paper' }}>
      {/* Message Input */}
      <Box flex={1} sx={{ position: 'relative' }}>
        <InputBase
          fullWidth
          multiline
          rows={1}
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled || isRecording}
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 1.5,
            '&:focus': {
              borderColor: 'primary.main',
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary?.light?.slice(0, -2) + '33'}`,
            },
          }}
          endAdornment={
            message && (
              <IconButton
                size="large"
                onClick={handleSend}
                disabled={disabled}
                sx={{ mr: -1.5 }}
              >
                <Send color="primary" />
              </IconButton>
            )
          }
        />

        {/* Voice Recording Indicator */}
        {isRecording && (
          <Box
            position="absolute"
            top={-8}
            right={16}
            bgcolor="error.main"
            color="common.white"
            px={1}
            py={0.5}
            borderRadius={12}
            fontSize="0.75rem"
            fontWeight="bold"
          >
            Recording...
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* Voice Message */}
        <Tooltip title={isRecording ? 'Stop recording' : 'Voice message'}>
          <IconButton
            onClick={handleVoiceRecording}
            disabled={disabled}
            size="large"
          >
            {isRecording ? <Stop /> : <Mic />}
          </IconButton>
        </Tooltip>

        {/* File Upload */}
        <Tooltip title="Attach file">
          <IconButton
            onClick={handlePopoverOpen}
            disabled={disabled}
            size="large"
          >
            <InsertDriveFile />
          </IconButton>
        </Tooltip>

        {/* Emojis - placeholder */}
        <Tooltip title="Emojis">
          <IconButton disabled size="large">
            <InsertEmoticon />
          </IconButton>
        </Tooltip>

        {/* Popover for file upload */}
        <Popover
          open={open}
          anchorEl={popoverAnchor}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: {
              p: 1,
            },
          }}
        >
          <input
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<Attachment />}
              fullWidth
            >
              Select File
            </Button>
          </label>
        </Popover>
      </Box>
    </Box>
  );
};