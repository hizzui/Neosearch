import React, { useState, useEffect } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import { motion } from 'motion/react';
import { SkipBack, SkipForward } from 'lucide-react';
import { apiService, type Track } from '../lib/api';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  genreId?: string;
  genreName?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ genreId, genreName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  
  const playerRef = React.useRef<any>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  // Fetch tracks from backend when genre changes
  useEffect(() => {
    if (!genreId) return;
    
    // Reset state completely when genre changes
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setDuration(0);
    
    // Pause current playback
    if (playerRef.current?.audio.current) {
      playerRef.current.audio.current.pause();
      playerRef.current.audio.current.currentTime = 0;
    }
    
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const response = await apiService.getGenreTracks(genreId, 10);
        
        if (response.tracks && response.tracks.length > 0) {
          // Filter tracks with preview URLs only
          const previewTracks = response.tracks.filter(t => t.preview_url);
          setTracks(previewTracks.length > 0 ? previewTracks : generateMockTracks(genreId, genreName));
        } else {
          // Fallback to mock tracks if no previews available
          setTracks(generateMockTracks(genreId, genreName));
        }
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
        setTracks(generateMockTracks(genreId, genreName));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTracks();
  }, [genreId, genreName]);

  // Generate mock tracks as fallback
  const generateMockTracks = (id: string, name?: string): Track[] => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `mock-${i}`,
      name: `${name} - Track ${i + 1}`,
      preview_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(parseInt(id) + i) % 16 + 1}.mp3`,
      duration_ms: 180000,
      popularity: 70
    }));
  };

  const currentTrack = tracks[currentTrackIndex];
  const currentTrackName = currentTrack?.name || 'No Track';

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.audio.current?.pause();
      } else {
        playerRef.current.audio.current?.play();
      }
    }
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    if (playerRef.current?.audio.current) {
      playerRef.current.audio.current.currentTime = percentage * (playerRef.current.audio.current.duration || 0);
      setCurrentTime(percentage * (playerRef.current.audio.current.duration || 0));
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle track changes (when user clicks skip)
  React.useEffect(() => {
    if (playerRef.current?.audio.current && currentTrack?.preview_url) {
      // Reset audio player state when track index changes
      const audio = playerRef.current.audio.current;
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

  // Auto-play next track when current ends
  React.useEffect(() => {
    const audio = playerRef.current?.audio.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('Track ended, playing next...');
      setIsPlaying(false);
      // Auto-play next track
      setTimeout(() => {
        handleNextTrack();
      }, 500);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [tracks, currentTrackIndex]);

  React.useEffect(() => {
    const audio = playerRef.current?.audio.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [isDragging]);

  return (
    <div className="w-full border-4 border-brutal-black bg-brutal-white brutal-shadow-sm">
      {/* Header with Title + Close Button */}
      <div className="border-b-4 border-brutal-black px-6 py-3 bg-brutal-paper flex items-center justify-between">
        <h3 className="text-sm font-display font-bold text-brutal-black uppercase tracking-tight">
          {genreName || '—'}
        </h3>
        <button className="border-3 border-brutal-black bg-brutal-white hover:bg-brutal-paper active:bg-brutal-black text-brutal-black active:text-brutal-white px-2 py-0 font-mono font-black text-base leading-none transition-all">
          ✕
        </button>
      </div>

      {/* Player Content */}
      <div className="px-6 py-5">
        {currentTrack && currentTrack.preview_url ? (
          <div className="space-y-4 flex flex-col items-center">
            {/* Track Name Display - Clean Header Style */}
            <p className="text-4xl font-mono font-bold text-brutal-black uppercase tracking-wider">
              {currentTrackName}
            </p>

            {/* H5 Audio Player - Hidden */}
            <style>{`
              .brutal-player {
                display: none !important;
              }
            `}</style>

            <div className="brutal-player">
              <H5AudioPlayer
                ref={playerRef}
                src={currentTrack.preview_url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                layout="stacked-reverse"
                showJumpControls={false}
                header=""
                footer=""
              />
            </div>

            {/* Status Display - Replace Play Button (Clickable) */}
            <button 
              onClick={togglePlayPause}
              className="flex gap-0.5 justify-center my-4 cursor-pointer hover:opacity-70 transition-opacity"
            >
              {isPlaying ? (
                <>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-6 bg-brutal-black" />
                </>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-mono font-bold text-brutal-black leading-none">⏸</p>
                </div>
              )}
            </button>

            {/* Skip Controls - Below Play Button */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handlePrevTrack}
                className="border-3 border-brutal-black bg-brutal-white hover:bg-brutal-paper active:bg-brutal-black active:text-brutal-white p-1.5 transition-all"
                title="Previous"
              >
                <SkipBack size={16} className="text-brutal-black" strokeWidth={3} />
              </button>

              <button
                onClick={handleNextTrack}
                className="border-3 border-brutal-black bg-brutal-white hover:bg-brutal-paper active:bg-brutal-black active:text-brutal-white p-1.5 transition-all"
                title="Next"
              >
                <SkipForward size={16} className="text-brutal-black" strokeWidth={3} />
              </button>
            </div>

            {/* Progress Bar - Full Width at Bottom - Draggable */}
            <div 
              ref={progressBarRef}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
              onMouseLeave={handleProgressMouseUp}
              className="w-full mt-6 bg-brutal-black h-2 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer hover:h-3 transition-all group"
            >
              <div 
                className={`h-full ${isPlaying ? 'bg-brutal-lime' : 'bg-brutal-black'} transition-all duration-100`}
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs font-mono font-bold text-brutal-black opacity-50 uppercase">
              SELECT A NODE
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
