
import React from 'react';
import { Button } from '@/components/ui/button';

type VibeSelectionProps = {
  onVibeSelect: (vibes: string[]) => void;
};

const VibeSelection: React.FC<VibeSelectionProps> = ({ onVibeSelect }) => {
  const [selectedVibes, setSelectedVibes] = React.useState<string[]>([]);
  
  const vibes = [
    { name: 'Quick & Easy', emoji: '⚡', color: 'bg-recipe-terracota' },
    { name: 'Comfort Food', emoji: '🍲', color: 'bg-recipe-sunset' },
    { name: 'Healthy', emoji: '🥗', color: 'bg-recipe-olive' },
    { name: 'Gourmet', emoji: '👨‍🍳', color: 'bg-recipe-rojo' },
    { name: 'Budget-Friendly', emoji: '💰', color: 'bg-recipe-terracota' },
    { name: 'Family Meal', emoji: '👪', color: 'bg-recipe-olive' },
    { name: 'Spicy', emoji: '🌶️', color: 'bg-recipe-rojo' },
    { name: 'Sweet Tooth', emoji: '🍰', color: 'bg-recipe-sunset' },
  ];

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  return (
    <div className="p-2 mt-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-recipe-terracota">
        What's your vibe today?
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            onClick={() => toggleVibe(vibe.name)}
            className={`relative overflow-hidden rounded-xl shadow-md transition-all duration-300 ${
              selectedVibes.includes(vibe.name) 
                ? `${vibe.color} text-white ring-2 ring-offset-2 ring-${vibe.color.replace('bg-', '')} scale-95` 
                : 'bg-card hover:scale-105'
            } p-4 flex flex-col items-center gap-2`}
          >
            <span className="text-3xl">{vibe.emoji}</span>
            <span className="font-medium text-sm">{vibe.name}</span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => onVibeSelect(selectedVibes)}
        className="w-full bg-recipe-terracota hover:bg-recipe-terracota/90 transition-opacity"
        size="lg"
        disabled={selectedVibes.length === 0}
      >
        Find Recipes
      </Button>
    </div>
  );
};

export default VibeSelection;
