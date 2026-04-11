import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Zap } from 'lucide-react';

const RAW_NAMES = [
  'SYNTHWAVE', 'LO-FI', 'BOSSA NOVA', 'MATH ROCK', 'TECHNO', 'JAZZ', 
  'METAL', 'PUNK', 'DISCO', 'HOUSE', 'TRAP', 'DRILL', 'GRIME',
  'FOLK', 'BLUES', 'SOUL', 'FUNK', 'REGGAE', 'SKA', 'DUB'
];

export const IngestionPanel: React.FC = () => {
  const [streams, setStreams] = useState<{ id: number; name: string; y: number }[]>([]);
  const [glitchKey, setGlitchKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStream = {
        id: Date.now(),
        name: RAW_NAMES[Math.floor(Math.random() * RAW_NAMES.length)],
        y: Math.random() * 80 + 10,
      };
      setStreams(prev => [...prev.slice(-20), newStream]);
      
      // Trigger small glitch effect every few streams (sem som)
      if (Math.random() < 0.2) {
        setGlitchKey(k => k + 1);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-brutal-paper relative overflow-hidden">
      <div className="p-6 bg-brutal-black text-brutal-white">
        <h2 className="text-4xl leading-none">NEOSEARCH</h2>
        <div className="flex items-center gap-2 mt-2 font-mono text-xs opacity-70">
          <Database size={14} />
          <span>STREAMING FROM LOCAL MUSIC FILES</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence>
          {streams.map((stream, idx) => (
            <motion.div
              key={stream.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ 
                x: '120%', 
                opacity: [0, 1, 1, 0],
                // Random glitch every few packets
                skewX: idx % 5 === 0 ? [0, -2, 2, -1, 0] : 0,
                scaleY: idx % 7 === 0 ? [1, 0.98, 1.02, 1] : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2, 
                ease: "linear",
                skewX: { duration: 0.1 },
                scaleY: { duration: 0.1 }
              }}
              className="absolute whitespace-nowrap font-mono font-bold text-sm tracking-tighter"
              style={{ top: `${stream.y}%` }}
            >
              <div className="flex items-center gap-2">
                <span className="bg-brutal-black text-brutal-white px-1">{stream.name}</span>
                <div className="h-[1px] w-20 bg-brutal-black opacity-20" />
                <Zap size={10} className="text-brutal-orange" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Glitch Overlay - Random corruption visual */}
        {glitchKey % 3 === 0 && (
          <motion.div
            key={`glitch-${glitchKey}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.3, 1, 0] }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(${Math.random() * 360}deg, rgba(255,0,255,0.1) 0%, transparent 50%, rgba(0,255,255,0.1) 100%)`,
              mixBlendMode: 'screen'
            }}
          />
        )}

        {/* API Icons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
          <motion.div 
            animate={{ rotate: glitchKey % 2 === 0 ? [0, -2, 2, -1, 0] : 0 }}
            className="brutal-border bg-brutal-black text-brutal-white p-2 text-xs font-bold rotate-[-5deg]"
          >
            LOCAL_STORAGE
          </motion.div>
          <div className="brutal-border bg-brutal-white text-brutal-black p-2 text-xs font-bold rotate-[3deg]">
            METADATA_DB
          </div>
        </div>
      </div>

      <div className="p-4 border-t-4 border-brutal-black bg-brutal-lime font-mono text-[10px] font-bold">
        STATUS: INGESTING_RAW_DATA_PACKETS... [OK]
      </div>
    </div>
  );
};
