import React, { useEffect, useState } from 'react';
import { testFirebaseConnection } from '../utils/firebase-test';

export const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<{
    success?: boolean;
    userId?: string;
    collections?: string[];
    error?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      try {
        const result = await testFirebaseConnection();
        setStatus(result);
      } catch (error) {
        setStatus({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  if (loading) {
    return <div>Testing Firebase connection...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      {status.success ? (
        <div className="space-y-2">
          <div className="text-green-600">✅ Connection successful</div>
          <div>User ID: {status.userId}</div>
          <div>
            <h3 className="font-semibold">Initialized Collections:</h3>
            <ul className="list-disc pl-5">
              {status.collections?.map((collection) => (
                <li key={collection}>{collection}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-red-600">
          ❌ Connection failed: {status.error}
        </div>
      )}
    </div>
  );
}; 