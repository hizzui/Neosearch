import React, { useState, useEffect } from 'react';
import { Music, Loader } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

interface Track {
  id: string;
  name: string;
  artists: string[];
  preview_url: string;
  duration_ms: number;
  popularity: number;
}

interface GenreMusicPlayerProps {
  genreId: string;
  genreName: string;
}

export const GenreMusicPlayer: React.FC<GenreMusicPlayerProps> = ({ genreId, genreName }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        try {
          const response = await fetch(
            `${apiUrl}/api/genre/${genreId}/tracks?limit=20`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch tracks: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Filter tracks that have preview URLs
          const tracksWithPreview = (data.tracks || []).filter(
            (track: Track) => track.preview_url
          );

          if (tracksWithPreview.length === 0) {
            setError('No preview tracks available for this genre');
            setTracks([]);
          } else {
            setTracks(tracksWithPreview);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          if (fetchErr instanceof Error) {
            if (fetchErr.name === 'AbortError') {
              throw new Error('Request timeout - server took too long');
            }
            throw fetchErr;
          }
          throw fetchErr;
        }
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tracks');
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    if (genreId) {
      fetchTracks();
    }
  }, [genreId]);

  if (loading) {
    return (
      <div className="brutal-border bg-brutal-black p-6 text-brutal-white font-mono flex items-center justify-center gap-3 min-h-64">
        <Loader size={20} className="animate-spin" />
        <span>Loading tracks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brutal-border bg-brutal-black p-6 text-brutal-white font-mono space-y-2">
        <div className="flex items-center gap-2 text-brutal-lime">
          <Music size={20} />
          <span className="uppercase font-bold">{genreName}</span>
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="brutal-border bg-brutal-black p-6 text-brutal-white font-mono">
        <p>No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Music size={24} className="text-brutal-lime" />
        <h2 className="text-2xl font-bold uppercase text-brutal-lime">{genreName} - Music Discovery</h2>
      </div>
      <MusicPlayer tracks={tracks} genreName={genreName} />
    </div>
  );
};
