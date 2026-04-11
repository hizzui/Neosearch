import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

interface FilterPanelProps {
  onEnergyChange?: (min: number, max: number) => void;
  onOrganicityChange?: (min: number, max: number) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onEnergyChange,
  onOrganicityChange 
}) => {
  const [energyMin, setEnergyMin] = useState(0);
  const [energyMax, setEnergyMax] = useState(100);
  const [organicMin, setOrganicMin] = useState(0);
  const [organicMax, setOrganicMax] = useState(100);

  const handleEnergyMinChange = (val: number) => {
    setEnergyMin(Math.min(val, energyMax - 5));
    onEnergyChange?.(Math.min(val, energyMax - 5), energyMax);
  };

  const handleEnergyMaxChange = (val: number) => {
    setEnergyMax(Math.max(val, energyMin + 5));
    onEnergyChange?.(energyMin, Math.max(val, energyMin + 5));
  };

  const handleOrganicMinChange = (val: number) => {
    setOrganicMin(Math.min(val, organicMax - 5));
    onOrganicityChange?.(Math.min(val, organicMax - 5), organicMax);
  };

  const handleOrganicMaxChange = (val: number) => {
    setOrganicMax(Math.max(val, organicMin + 5));
    onOrganicityChange?.(organicMin, Math.max(val, organicMin + 5));
  };

  const resetFilters = () => {
    setEnergyMin(0);
    setEnergyMax(100);
    setOrganicMin(0);
    setOrganicMax(100);
    onEnergyChange?.(0, 100);
    onOrganicityChange?.(0, 100);
  };

  return (
    <div className="w-full brutal-border bg-brutal-white brutal-shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 brutal-border bg-brutal-lime flex items-center justify-center">
          <Sliders size={16} className="text-brutal-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-mono font-bold text-brutal-black">GENRE FILTERS</h3>
          <p className="text-[10px] font-mono text-brutal-black opacity-60">
            Filter by Energy × Organicity
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ENERGY SLIDER */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-mono font-bold text-brutal-black uppercase">
              ENERGY
            </label>
            <span className="text-[10px] font-mono bg-brutal-lime px-2 py-1 brutal-border">
              {energyMin} — {energyMax}
            </span>
          </div>
          
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={energyMin}
              onChange={(e) => handleEnergyMinChange(parseInt(e.target.value))}
              className="flex-1 h-3 brutal-border bg-brutal-pink appearance-none cursor-pointer slider-thumb"
              style={{
                accentColor: '#CCFF00',
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={energyMax}
              onChange={(e) => handleEnergyMaxChange(parseInt(e.target.value))}
              className="flex-1 h-3 brutal-border bg-brutal-orange appearance-none cursor-pointer slider-thumb"
              style={{
                accentColor: '#FF00FF',
              }}
            />
          </div>

          <div className="text-[9px] font-mono text-brutal-black opacity-50 flex justify-between">
            <span>Lo-Fi (Chill)</span>
            <span>Techno (Intense)</span>
          </div>
        </div>

        {/* ORGANICITY SLIDER */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-mono font-bold text-brutal-black uppercase">
              ORGANICITY
            </label>
            <span className="text-[10px] font-mono bg-brutal-orange px-2 py-1 brutal-border">
              {organicMin} — {organicMax}
            </span>
          </div>
          
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={organicMin}
              onChange={(e) => handleOrganicMinChange(parseInt(e.target.value))}
              className="flex-1 h-3 brutal-border bg-brutal-orange appearance-none cursor-pointer slider-thumb"
              style={{
                accentColor: '#CCFF00',
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={organicMax}
              onChange={(e) => handleOrganicMaxChange(parseInt(e.target.value))}
              className="flex-1 h-3 brutal-border bg-brutal-pink appearance-none cursor-pointer slider-thumb"
              style={{
                accentColor: '#FF00FF',
              }}
            />
          </div>

          <div className="text-[9px] font-mono text-brutal-black opacity-50 flex justify-between">
            <span>Electronic (Synth)</span>
            <span>Acoustic (Live)</span>
          </div>
        </div>
      </div>

      {/* RESET BUTTON */}
      <button
        onClick={resetFilters}
        className="w-full brutal-border bg-brutal-gray text-brutal-black px-4 py-2 font-mono text-[10px] font-bold uppercase hover:bg-brutal-lime transition-all hover:shadow-none active:translate-x-[1px] active:translate-y-[1px] brutal-shadow-sm"
      >
        RESET FILTERS
      </button>

      {/* Filter Info */}
      <div className="bg-brutal-paper border-2 border-brutal-black p-3 text-[9px] font-mono">
        <div className="font-bold text-brutal-black mb-1">ACTIVE FILTERS:</div>
        <div className="text-brutal-black opacity-70 space-y-1">
          <div>• Energy: {energyMin}% → {energyMax}%</div>
          <div>• Organicity: {organicMin}% → {organicMax}%</div>
        </div>
      </div>
    </div>
  );
};
