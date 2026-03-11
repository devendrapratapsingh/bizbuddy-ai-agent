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
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem
} from '@mui/material';
import {
  Phone,
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  MoreVert,
  VolumeUp,
  VolumeOff,
  CallMissed,
  CallReceived,
  CallMade,
  CallMerge,
  CallSplit,
  SwapCalls,
  StopScreenShare,
  ScreenShare,
  PauseCircleFilled,
  PlayCircleFilled,
  FastRewind,
  FastForward,
  SkipNext,
  SkipPrevious,
  FiberManualRecord
} from '@mui/icons-material';

export const VoiceCallPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [callInfo, setCallInfo] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnectedCall, setIsConnectedCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  const [audioInputs, setAudioInputs] = useState<any[]>([]);
  const [videoInputs, setVideoInputs] = useState<any[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Simulate fetching call data
        const mockCall = {
          id: 'call-1',
          business: {
            name: 'Acme Corporation',
            industry: 'Technology'
          },
          customer: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            avatar: ''
          },
          status: 'IN_PROGRESS',
          metadata: {
            startedAt: new Date().toISOString(),
            participants: [
              { id: user?.id, name: user?.name, role: 'agent' },
              { id: 'customer-1', name: 'John Doe', role: 'customer' }
            ]
          }
        };

        setCallInfo(mockCall);
        setIsCalling(true);

        // Get media devices
        await getMediaDevices();

        // Request camera and microphone access
        await requestLocalStream();
      } catch (err) {
        console.error('Error initializing call:', err);
        setError('Failed to initialize call. Please check your camera and microphone permissions.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initializeCall();
    }

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, user]);

  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

      setAudioInputs(audioInputs);
      setVideoInputs(videoInputs);
      setAudioOutputs(audioOutputs);

      // Set default devices
      if (audioInputs.length > 0) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }
      if (audioOutputs.length > 0) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting media devices:', error);
    }
  };

  const requestLocalStream = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: isVideoOn ? {
          deviceId: selectedVideoInput ? { exact: selectedVideoInput } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsConnectedCall(true);

      console.log('Local stream acquired successfully');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Failed to access camera or microphone. Please check permissions.');
    }
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !track.enabled);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real app, you would switch audio output
  };

  const startRecording = () => {
    setRecording(true);
    setRecordingDuration(0);

    // Start recording timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // Clean up timer when component unmounts
    return () => clearInterval(timer);
  };

  const stopRecording = () => {
    setRecording(false);
    setRecordingDuration(0);
    // In a real app, you would save the recording
  };

  const handleDeviceChange = async (deviceType: string, deviceId: string) => {
    switch (deviceType) {
      case 'audioInput':
        setSelectedAudioInput(deviceId);
        break;
      case 'videoInput':
        setSelectedVideoInput(deviceId);
        break;
      case 'audioOutput':
        setSelectedAudioOutput(deviceId);
        break;
      default:
        return;
    }

    // Reinitialize stream with new device
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    await requestLocalStream();
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Connecting call...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={4}>
        <Typography variant="h4" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!callInfo) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Call not found</Typography>
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
            {callInfo.customer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              {callInfo.customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {callInfo.business.name}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={callInfo.status}
            size="small"
            color="primary"
          />
          <IconButton size="large" onClick={handleEndCall}>
            <CallEnd color="error" style={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Video Call Area */}
      <Box
        position="relative"
        height="60vh"
        bgcolor="background.paper"
        border={1}
        borderColor="divider"
        borderRadius={4}
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {/* Remote Video */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#000"
        >
          <Typography variant="h6" color="text.secondary">
            Remote Video
          </Typography>
        </Box>

        {/* Local Video */}
        <Box
          position="absolute"
          bottom={16}
          right={16}
          width="200px"
          height="150px"
          border={2}
          borderColor="primary.main"
          borderRadius={4}
          bgcolor="#000"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <Typography variant="body2" color="text.secondary">
            Local Video
          </Typography>
        </Box>

        {/* Recording Indicator */}
        {recording && (
          <Box
            position="absolute"
            top={16}
            left="50%"
            transform="translateX(-50%)"
            bgcolor="error.main"
            color="common.white"
            px={2}
            py={1}
            borderRadius={20}
            display="flex"
            alignItems="center"
            gap={1}
            zIndex={2}
          >
            <FiberManualRecord style={{ fontSize: 16 }} />
            <Typography variant="body2">
              Recording {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Call Controls */}
      <Box
        display="flex"
        justifyContent="center"
        gap={2}
        mb={3}
      >
        {/* Audio Input */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Microphone</InputLabel>
          <Select
            value={selectedAudioInput}
            label="Microphone"
            onChange={(e) => handleDeviceChange('audioInput', e.target.value as string)}
          >
            {audioInputs.map((device) => (
              <SelectMenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || 'Microphone'}
              </SelectMenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Video Input */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Camera</InputLabel>
          <Select
            value={selectedVideoInput}
            label="Camera"
            onChange={(e) => handleDeviceChange('videoInput', e.target.value as string)}
          >
            {videoInputs.map((device) => (
              <SelectMenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || 'Camera'}
              </SelectMenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Audio Output */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Speaker</InputLabel>
          <Select
            value={selectedAudioOutput}
            label="Speaker"
            onChange={(e) => handleDeviceChange('audioOutput', e.target.value as string)}
          >
            {audioOutputs.map((device) => (
              <SelectMenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || 'Speaker'}
              </SelectMenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Main Controls */}\n      <Box
        display="flex"
        justifyContent="center"
        gap={3}
        mb={3}
      >
        <IconButton
          size="large"
          onClick={toggleMute}
          color={isMuted ? 'error' : 'primary'}
          sx={{ bgcolor: isMuted ? 'error.lighter' : 'primary.lighter' }}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>

        <IconButton
          size="large"
          onClick={toggleVideo}
          color={isVideoOn ? 'primary' : 'error'}
          sx={{ bgcolor: isVideoOn ? 'primary.lighter' : 'error.lighter' }}
        >
          {isVideoOn ? <Videocam /> : <VideocamOff />}
        </IconButton>

        <IconButton
          size="large"
          onClick={toggleSpeaker}
          color={isSpeakerOn ? 'primary' : 'error'}
          sx={{ bgcolor: isSpeakerOn ? 'primary.lighter' : 'error.lighter' }}
        >
          <VolumeUp />
        </IconButton>

        <IconButton
          size="large"
          onClick={() => recording ? stopRecording() : startRecording()}
          color={recording ? 'error' : 'primary'}
          sx={{ bgcolor: recording ? 'error.lighter' : 'primary.lighter' }}
        >
          <FiberManualRecord />
        </IconButton>
      </Box>

      {/* Additional Controls */}
      <Box
        display="flex"
        justifyContent="center"
        gap={2}
      >
        <IconButton size="large" color="primary" sx={{ bgcolor: 'primary.lighter' }}>
          <ScreenShare />
        </IconButton>
        <IconButton size="large" color="primary" sx={{ bgcolor: 'primary.lighter' }}>
          <PauseCircleFilled />
        </IconButton>
        <IconButton size="large" color="primary" sx={{ bgcolor: 'primary.lighter' }}>
          <FiberManualRecord />
        </IconButton>
      </Box>
    </Box>
  );
};