import React, { useState, useEffect } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { SashaChat } from './SashaChat';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

const DashboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

interface SashaDashboardProps {
  agentId?: string;
}

export const SashaDashboard: React.FC<SashaDashboardProps> = ({ agentId }) => {
  const {
    agent,
    loading,
    error,
    deployAgent,
    updateConfig,
    getMetrics,
    getCapabilities,
    checkHealth,
  } = useAgent(agentId);

  const [metrics, setMetrics] = useState<any>(null);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, capabilitiesData] = await Promise.all([
          getMetrics(),
          getCapabilities(),
        ]);
        setMetrics(metricsData);
        setCapabilities(capabilitiesData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadData();
  }, [getMetrics, getCapabilities]);

  useEffect(() => {
    const checkConnection = async () => {
      const healthy = await checkHealth();
      setIsConnected(healthy);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await deployAgent();
    } catch (err) {
      console.error('Failed to deploy agent:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await updateConfig({
        // Add any configuration updates here
        preferences: {
          ...agent?.preferences,
          // Example: update response style
          responseStyle: 'concise',
        },
      });
    } catch (err) {
      console.error('Failed to update config:', err);
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
    <DashboardContainer elevation={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sasha Dashboard</Typography>
        <Box>
          <Tooltip title="Refresh Status">
            <IconButton onClick={() => checkHealth()} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Configuration">
            <IconButton onClick={handleUpdateConfig} size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SashaChat agentId={agentId} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MetricCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Agent Status
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {agent?.status || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated: {new Date(agent?.updatedAt || '').toLocaleString()}
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>

            {metrics && (
              <Grid item xs={12}>
                <MetricCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Success Rate: {metrics.successRate || 0}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Usage Count: {metrics.usageCount || 0}
                    </Typography>
                  </CardContent>
                </MetricCard>
              </Grid>
            )}

            {capabilities.length > 0 && (
              <Grid item xs={12}>
                <MetricCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Capabilities
                    </Typography>
                    {capabilities.map((capability, index) => (
                      <Typography key={index} variant="body2" color="textSecondary">
                        • {capability}
                      </Typography>
                    ))}
                  </CardContent>
                </MetricCard>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleDeploy}
                disabled={isDeploying || !isConnected}
              >
                {isDeploying ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Deploying...
                  </>
                ) : (
                  'Deploy Agent'
                )}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}; 