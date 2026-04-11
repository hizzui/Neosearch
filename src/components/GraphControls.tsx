import React from 'react';

export const GraphControls: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 z-40 pointer-events-none select-none">
      <div className="brutal-border bg-brutal-white px-4 py-3 font-mono text-[9px] space-y-1 brutal-shadow-sm">
        <div className="font-bold text-brutal-black">GRAPH CONTROLS</div>
        <div className="h-[1px] bg-brutal-black my-2 opacity-30" />
        <div className="text-brutal-black"><span className="font-bold">DRAG:</span> Pull nodes</div>
        <div className="text-brutal-black"><span className="font-bold">SCROLL:</span> Zoom in/out</div>
        <div className="text-brutal-black"><span className="font-bold">DRAG BG:</span> Pan view</div>
        <div className="text-brutal-black"><span className="font-bold">CLICK:</span> Select genre</div>
      </div>
    </div>
  );
};
