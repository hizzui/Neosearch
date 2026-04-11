import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  artists: string[];
  preview_url: string;
  duration_ms: number;
  popularity: number;
}

interface MusicPlayerProps {
  tracks: Track[];
  genreName?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ tracks, genreName }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play track:', err);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="brutal-border bg-brutal-black p-6 text-brutal-white font-mono">
        <p>No tracks available</p>
      </div>
    );
  }

  return (
    <div className="brutal-border bg-brutal-black p-6 text-brutal-white font-mono space-y-4">
      {/* Genre Header */}
      {genreName && (
        <div className="text-sm uppercase border-b border-brutal-white pb-2 mb-4">
          Now Playing: {genreName}
        </div>
      )}

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-brutal-lime uppercase">{currentTrack.name}</h3>
        <p className="text-sm text-brutal-white opacity-80">
          {currentTrack.artists.join(', ')}
        </p>
        <p className="text-xs text-brutal-white opacity-60">
          Track {currentTrackIndex + 1} of {tracks.length}
        </p>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.preview_url}
        onEnded={handleTrackEnded}
        crossOrigin="anonymous"
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4">
        <button
          onClick={handlePrevious}
          className="brutal-border p-2 hover:bg-brutal-lime hover:text-brutal-black transition-colors"
          title="Previous track"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={handlePlayPause}
          className="brutal-border p-3 bg-brutal-lime text-brutal-black hover:bg-brutal-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={handleNext}
          className="brutal-border p-2 hover:bg-brutal-lime hover:text-brutal-black transition-colors"
          title="Next track"
        >
          <SkipForward size={20} />
        </button>

        <a
          href={`https://www.deezer.com/track/${currentTrack.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-border p-2 hover:bg-brutal-lime hover:text-brutal-black transition-colors inline-flex items-center gap-2"
          title="Listen full version on Deezer"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Duration */}
      <div className="text-xs text-brutal-white opacity-60 text-center">
        <div>Duration: {formatDuration(currentTrack.duration_ms)}</div>
      </div>

      {/* Track List */}
      <div className="mt-6 pt-4 border-t border-brutal-white space-y-2 max-h-40 overflow-y-auto">
        <p className="text-xs uppercase font-bold mb-2">Queue:</p>
        {tracks.map((track, idx) => (
          <button
            key={track.id}
            onClick={() => {
              setCurrentTrackIndex(idx);
              setIsPlaying(false);
            }}
            className={`w-full text-left p-2 text-xs brutal-border transition-colors ${
              idx === currentTrackIndex
                ? 'bg-brutal-lime text-brutal-black'
                : 'hover:bg-brutal-black hover:text-brutal-lime'
            }`}
          >
            <div className="font-bold">{track.name}</div>
            <div className="opacity-70">{track.artists.join(', ')}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
