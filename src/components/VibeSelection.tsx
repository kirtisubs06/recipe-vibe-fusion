
import React from 'react';
import { Button } from '@/components/ui/button';

type VibeSelectionProps = {
  onVibeSelect: (vibes: string[]) => void;
};

const VibeSelection: React.FC<VibeSelectionProps> = ({ onVibeSelect }) => {
  const [selectedVibes, setSelectedVibes] = React.useState<string[]>([]);
  
  const vibes = [
    { name: 'Quick & Easy', emoji: '⚡', color: 'bg-recipe-primary' },
    { name: 'Comfort Food', emoji: '🍲', color: 'bg-recipe-yellow' },
    { name: 'Healthy', emoji: '🥗', color: 'bg-recipe-mint' },
    { name: 'Gourmet', emoji: '👨‍🍳', color: 'bg-recipe-purple' },
    { name: 'Budget-Friendly', emoji: '💰', color: 'bg-blue-500' },
    { name: 'Family Meal', emoji: '👪', color: 'bg-orange-400' },
    { name: 'Spicy', emoji: '🌶️', color: 'bg-red-600' },
    { name: 'Sweet Tooth', emoji: '🍰', color: 'bg-pink-400' },
  ];

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">What's your vibe today?</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            onClick={() => toggleVibe(vibe.name)}
            className={`${
              selectedVibes.includes(vibe.name) ? `${vibe.color} text-white ring-2 ring-offset-2` : 'bg-white'
            } p-4 rounded-xl shadow-md flex flex-col items-center gap-2 transition-all`}
          >
            <span className="text-3xl">{vibe.emoji}</span>
            <span className="font-medium">{vibe.name}</span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => onVibeSelect(selectedVibes)}
        className="w-full bg-recipe-primary hover:bg-recipe-primary/90"
        size="lg"
        disabled={selectedVibes.length === 0}
      >
        Find Recipes
      </Button>
    </div>
  );
};

export default VibeSelection;
