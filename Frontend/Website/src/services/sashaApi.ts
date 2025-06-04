interface ChatResponse {
  response: string;
  session_id: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function sendMessageToSasha(
  message: string,
  sessionId?: string,
  mode: 'default' | 'code' | 'devops' = 'default'
): Promise<ChatResponse> {
  try {
    // Build payload, only include session_id if it is a string
    const payload: any = { message, mode };
    if (typeof sessionId === 'string') {
      payload.session_id = sessionId;
    }
    const response = await fetchWithRetry('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  } catch (error) {
    console.error('Error sending message to Sasha:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to communicate with Sasha. Please try again.'
    );
  }
}

export async function clearConversation(sessionId: string): Promise<void> {
  try {
    await fetchWithRetry('http://localhost:8000/clear-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to clear conversation. Please try again.'
    );
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
} 