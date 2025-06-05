import React, { useState, useEffect, useRef } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { AgentMessage } from '../../services/api/agentService';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[200],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  marginLeft: isUser ? 'auto' : 0,
  marginRight: isUser ? 0 : 'auto',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

interface SashaChatProps {
  agentId?: string;
}

export const SashaChat: React.FC<SashaChatProps> = ({ agentId }) => {
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearConversation,
    checkHealth,
  } = useAgent(agentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkConnection = async () => {
      const healthy = await checkHealth();
      setIsConnected(healthy);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;
    
    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await clearConversation();
    } catch (err) {
      console.error('Failed to clear conversation:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ChatContainer elevation={3}>
      <ActionContainer>
        <Typography variant="h6">Chat with Sasha</Typography>
        <Tooltip title="Clear conversation">
          <IconButton onClick={handleClear} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </ActionContainer>

      {!isConnected && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to connect to Sasha. Please check if the server is running.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error.message}
        </Alert>
      )}

      <MessagesContainer>
        {messages.map((message: AgentMessage) => (
          <MessageBubble key={message.id} isUser={message.role === 'user'}>
            <Typography variant="body1">{message.content}</Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={!isConnected}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};