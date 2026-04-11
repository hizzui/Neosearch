import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Compass, ArrowRight, Music } from 'lucide-react';
import { apiService, type Genre } from '../lib/api';
import { GENRES as DEFAULT_GENRES } from '../data/genres';
import { cn } from '../lib/utils';
import { GenreMusicPlayer } from './GenreMusicPlayer';
import { playClickSound, playTransitionSound, enableAudio } from '../lib/audioEffects';

interface DashboardPanelProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState<Genre[]>(DEFAULT_GENRES);
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  
  // Handle genre selection with sound
  const handleGenreClick = (genreId: string) => {
    enableAudio(); // Ensure audio context is active
    playClickSound();
    onSelect?.(genreId);
  };
  
  // Play transition sound when genre changes
  useEffect(() => {
    if (selectedId && selectedId !== prevSelectedId && prevSelectedId !== null) {
      enableAudio();
      playTransitionSound();
    }
    setPrevSelectedId(selectedId);
  }, [selectedId, prevSelectedId]);
  
  // Fetch genres from backend on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const backendGenres = await apiService.getGenres();
        setGenres(backendGenres);
      } catch (error) {
        console.error('Failed to fetch genres from API, using defaults:', error);
        setGenres(DEFAULT_GENRES);
      }
    };
    
    fetchGenres();
  }, []);

  const filteredGenres = genres.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const selectedGenre = selectedId ? genres.find(g => g.id === selectedId) : null;

  return (
    <div className="h-full w-full flex flex-col bg-brutal-white relative overflow-hidden">
      <div className="p-6 bg-brutal-black text-brutal-white">
        <h2 className="text-4xl leading-none">DISCOVERY DASHBOARD</h2>
        <div className="flex items-center gap-2 mt-2 font-mono text-xs opacity-70">
          <Compass size={14} />
          <span>USER INTERFACE LAYER</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
        {/* Music Player - MAIN ELEMENT */}
        {selectedGenre && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="order-first"
          >
            <GenreMusicPlayer genreId={selectedGenre.id} genreName={selectedGenre.name} />
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            placeholder="SEARCH GENRES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full brutal-border p-4 font-display text-xl focus:outline-none focus:bg-brutal-lime transition-colors placeholder:text-brutal-black/30"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Explore Button */}
        <button 
          onClick={() => { enableAudio(); playClickSound(0.4); }}
          className="brutal-btn bg-brutal-lime text-brutal-black text-2xl py-4 flex items-center justify-center gap-4"
        >
          EXPLORE MAP <ArrowRight />
        </button>

        {/* Genre Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredGenres.slice(0, 6).map((genre) => (
            <motion.div
              key={genre.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleGenreClick(genre.id)}
              className={cn(
                "brutal-card p-4 flex flex-col gap-2 cursor-pointer group transition-colors",
                selectedId === genre.id ? "bg-brutal-lime" : "bg-brutal-white"
              )}
            >
              <div className="flex justify-between items-start">
                <Music size={16} className={cn(selectedId === genre.id ? "text-brutal-black" : "text-brutal-pink")} />
                {selectedId === genre.id && (
                  <motion.div 
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex gap-0.5 items-end"
                  >
                    <div className="w-1 bg-brutal-black h-full" />
                    <motion.div animate={{ height: [8, 4, 8] }} transition={{ duration: 0.4, repeat: Infinity }} className="w-1 bg-brutal-black h-full" />
                    <motion.div animate={{ height: [6, 10, 6] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1 bg-brutal-black h-full" />
                  </motion.div>
                )}
                <span className="font-mono text-[10px] opacity-50">#{genre.id}</span>
              </div>
              <h3 className="text-lg leading-tight group-hover:text-brutal-pink transition-colors">{genre.name}</h3>
              <div className="mt-auto pt-2 border-t-2 border-brutal-black/10 flex justify-between items-center">
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`h-2 w-2 brutal-border ${i < genre.popularity / 33 ? 'bg-brutal-orange' : 'bg-brutal-gray'}`} />
                  ))}
                </div>
                <span className="font-mono text-[10px]">POP: {genre.popularity}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alert Notification */}
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-auto brutal-border bg-brutal-orange p-4 text-brutal-white font-bold flex items-center gap-3"
        >
          <div className="h-6 w-6 bg-brutal-white" />
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest opacity-80">System Alert</span>
            <span className="text-sm">NEW CONNECTION FOUND: JAZZ ↔ SYNTHWAVE</span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t-4 border-brutal-black bg-brutal-black text-brutal-white font-mono text-[10px] font-bold flex justify-between">
        <span>USER: ANONYMOUS_EXPLORER</span>
        <span>SESSION: 0x8F2A...</span>
      </div>
    </div>
  );
};
