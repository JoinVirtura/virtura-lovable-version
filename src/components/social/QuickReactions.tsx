import { motion } from 'framer-motion';
import { useState } from 'react';

interface QuickReactionsProps {
  onReact: (emoji: string) => void;
}

const reactions = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😍', label: 'Amazing' },
  { emoji: '🤯', label: 'Mind Blown' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '💯', label: 'Perfect' },
];

export function QuickReactions({ onReact }: QuickReactionsProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    setSelectedEmoji(emoji);
    onReact(emoji);
    setTimeout(() => setSelectedEmoji(null), 1000);
  };

  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-40">
      {reactions.map(({ emoji, label }, index) => (
        <motion.button
          key={emoji}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.2, x: -8 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleReaction(emoji)}
          className="relative group"
          aria-label={label}
        >
          <div 
            className={`w-12 h-12 bg-background/40 backdrop-blur-xl rounded-full flex items-center justify-center text-2xl border border-primary/20 transition-all ${
              selectedEmoji === emoji ? 'ring-2 ring-primary bg-primary/20' : ''
            }`}
          >
            {emoji}
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className="bg-background/90 backdrop-blur-xl px-3 py-1 rounded-lg text-sm border border-primary/20">
              {label}
            </div>
          </div>

          {/* Burst effect */}
          {selectedEmoji === emoji && (
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
