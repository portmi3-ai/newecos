interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  auth0: {
    audience: string;
    issuerBaseUrl: string;
    clientId: string;
  };
  vertex: {
    projectId: string;
    location: string;
    apiEndpoint: string;
  };
  github: {
    token: string;
    repo: string;
  };
  huggingface: {
    apiKey: string;
  };
  monitoring: {
    sentryDsn: string;
    newRelicKey: string;
  };
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = import.meta.env.MODE || 'development';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const config: EnvironmentConfig = {
    apiUrl: baseUrl,
    wsUrl: baseUrl.replace('http', 'ws'),
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    },
    auth0: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
      issuerBaseUrl: import.meta.env.VITE_AUTH0_ISSUER_BASE_URL || '',
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    },
    vertex: {
      projectId: import.meta.env.VITE_VERTEX_AI_PROJECT_ID || '',
      location: import.meta.env.VITE_VERTEX_AI_LOCATION || 'us-central1',
      apiEndpoint: import.meta.env.VITE_VERTEX_AI_API_ENDPOINT || 'us-central1-aiplatform.googleapis.com',
    },
    github: {
      token: import.meta.env.VITE_GITHUB_TOKEN || '',
      repo: import.meta.env.VITE_GITHUB_REPO || '',
    },
    huggingface: {
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
    },
    monitoring: {
      sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
      newRelicKey: import.meta.env.VITE_NEW_RELIC_LICENSE_KEY || '',
    },
  };

  // Environment-specific overrides
  switch (env) {
    case 'production':
      config.apiUrl = import.meta.env.VITE_PROD_API_URL || config.apiUrl;
      config.wsUrl = config.apiUrl.replace('http', 'ws');
      break;
    case 'staging':
      config.apiUrl = import.meta.env.VITE_STAGING_API_URL || config.apiUrl;
      config.wsUrl = config.apiUrl.replace('http', 'ws');
      break;
    case 'development':
    default:
      // Use default development values
      break;
  }

  return config;
};

export const environment = getEnvironmentConfig();

// Helper function to check if we're in production
export const isProduction = () => import.meta.env.PROD;

// Helper function to check if we're in development
export const isDevelopment = () => import.meta.env.DEV;

// Helper function to check if we're in staging
export const isStaging = () => import.meta.env.MODE === 'staging';

// Helper function to get the current environment name
export const getEnvironment = () => import.meta.env.MODE || 'development'; 