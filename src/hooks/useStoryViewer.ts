import { useState } from 'react';

export function useStoryViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openStory = (index: number) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  const closeStory = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    initialIndex,
    openStory,
    closeStory,
  };
}
