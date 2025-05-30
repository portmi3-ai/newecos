import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as deploymentService from '../services/deploymentService';

const useDeploymentStatus = (deploymentId) => {
  const intervalRef = useRef(null);
  
  const {
    data: status,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['deploymentStatus', deploymentId],
    queryFn: () => deploymentService.getDeploymentStatus(deploymentId),
    enabled: !!deploymentId,
    refetchOnWindowFocus: false,
    // Don't auto-refetch for this query - we'll handle polling manually
    refetchInterval: 0,
  });
  
  useEffect(() => {
    // Start polling if deployment is in progress
    const startPolling = async () => {
      if (deploymentId && status?.status === 'deploying') {
        // Clear any existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Poll every 3 seconds if still deploying
        intervalRef.current = setInterval(async () => {
          const result = await refetch();
          
          // If no longer deploying, stop polling
          if (result.data && result.data.status !== 'deploying') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }, 3000);
      } else if (intervalRef.current) {
        // Clear interval if not deploying
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    startPolling();
    
    // Cleanup on unmount or deploymentId change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [deploymentId, status?.status, refetch]);
  
  return { status, loading, error };
};

export default useDeploymentStatus;