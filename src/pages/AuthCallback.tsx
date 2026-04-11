import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Verify state matches
        const savedState = sessionStorage.getItem('spotify_auth_state');
        if (state !== savedState) {
          throw new Error('State mismatch - potential security issue');
        }

        setStatus('Exchanging code for token...');

        // Exchange code for token via backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/auth/callback?code=${code}&state=${state}`);

        if (!response.ok) {
          throw new Error(`Failed to authenticate: ${response.statusText}`);
        }

        const data = await response.json();

        // Store token
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_user', JSON.stringify(data.user));

        setStatus('✅ Successfully authenticated!');

        // Redirect to home after 1 second
        setTimeout(() => {
          // Clear the query params
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/');
          window.location.reload(); // Reload to update auth state
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('Authentication failed');
        console.error('Auth callback error:', err);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-brutal-paper">
      <div className="brutal-border bg-brutal-white p-8 text-center max-w-md">
        <h1 className="text-2xl font-mono font-bold uppercase mb-4 text-brutal-black">
          {error ? '⚠️ ERROR' : '🎵 NEOSEARCH AUTH'}
        </h1>
        
        <p className="font-mono text-brutal-black mb-4">
          {status}
        </p>

        {error && (
          <div className="bg-brutal-orange p-2 brutal-border font-mono text-sm text-brutal-black mb-4">
            {error}
          </div>
        )}

        <div className="font-mono text-xs opacity-70">
          {error ? (
            <a href="/" className="text-brutal-pink hover:opacity-70 underline">
              Return to home
            </a>
          ) : (
            'Redirecting...'
          )}
        </div>
      </div>
    </div>
  );
};
