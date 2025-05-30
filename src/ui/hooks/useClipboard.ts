import { useState, useCallback, useEffect } from 'react';

interface UseClipboardOptions {
  /**
   * Timeout duration in ms
   */
  timeout?: number;
  /**
   * Format of the copied content
   */
  format?: string;
}

/**
 * Custom hook for copying text to clipboard
 * @param options - Configuration options
 * @returns Object with copy function, success state, and error
 */
function useClipboard({ timeout = 2000, format = 'text/plain' }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Clean up the timeout
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // The copy function
  const copy = useCallback(
    async (text: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          // Use modern Clipboard API if available
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          
          // Make the textarea out of viewport
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (!success) {
            throw new Error('Failed to copy text');
          }
        }

        setCopied(true);
        setError(null);
        
        // Reset after timeout
        const id = window.setTimeout(() => {
          setCopied(false);
          setTimeoutId(null);
        }, timeout);
        
        setTimeoutId(id);
      } catch (err) {
        console.error('Failed to copy text:', err);
        setCopied(false);
        setError(err instanceof Error ? err : new Error('Failed to copy text'));
      }
    },
    [timeout, timeoutId]
  );

  return { copy, copied, error };
}

export default useClipboard;