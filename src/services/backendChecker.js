// Simple utility to check if backend is reachable

const checkBackendStatus = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://agent-ecos-api-xxxxxxxxxx-uc.a.run.app';
  
  try {
    // Try to connect to the API health endpoint
    const response = await fetch(`${apiUrl}/health`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        status: 'connected', 
        message: 'Backend is reachable',
        serverTime: data.timestamp 
      };
    } else {
      return { 
        status: 'error', 
        message: `Backend returned status: ${response.status}` 
      };
    }
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    return { 
      status: 'error', 
      message: 'Could not connect to backend API. Using mock data instead.' 
    };
  }
};

export { checkBackendStatus };