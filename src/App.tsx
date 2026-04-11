import React, { useState } from 'react';
import { IngestionPanel } from './components/IngestionPanel';
import { GraphPanel } from './components/GraphPanel';
import { DashboardPanel } from './components/DashboardPanel';

export default function App() {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-brutal-paper selection:bg-brutal-lime selection:text-brutal-black">
      {/* Left Section: Data Ingestion */}
      <section className="w-[30%] min-w-[350px] h-full hidden sm:flex border-r-4 border-brutal-black overflow-hidden">
        <IngestionPanel onGenreClick={setSelectedGenreId} />
      </section>

      {/* Center Section: Graph Database */}
      <section className="flex-1 min-w-[500px] h-full border-r-4 border-brutal-black overflow-hidden">
        <GraphPanel selectedId={selectedGenreId} onSelect={setSelectedGenreId} />
      </section>

      {/* Right Section: User Interface */}
      <section className="w-[35%] min-w-[400px] h-full overflow-hidden">
        <DashboardPanel selectedId={selectedGenreId} onSelect={setSelectedGenreId} />
      </section>

      {/* Global Overlay */}
      <div className="fixed top-4 right-4 z-50 pointer-events-auto">
        <div className="brutal-border bg-brutal-white px-2 py-1 text-[10px] font-mono font-bold brutal-shadow-sm pointer-events-none">
          v1.0.5_DEEZER_EDITION
        </div>
      </div>
    </div>
  );
}
