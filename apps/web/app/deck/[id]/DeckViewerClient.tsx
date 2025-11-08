'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeckViewer, EndDeckModal } from '@pd/ui';
import { trackEvent } from '@pd/analytics';
import { marked } from 'marked';

interface Slide {
  id: string;
  title: string;
  content: string;
  index: number;
}

interface Deck {
  id: string;
  title: string;
  slides: Array<{
    id: string;
    deckId: string;
    index: number;
    title: string;
    content: string;
    assets: unknown;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

interface DeckViewerClientProps {
  deck: Deck;
}

export default function DeckViewerClient({ deck }: DeckViewerClientProps) {
  const router = useRouter();
  const [showEndModal, setShowEndModal] = useState(false);
  const [hasTriggeredEnd, setHasTriggeredEnd] = useState(false);

  // Convert markdown to HTML for slides
  const slides: Slide[] = deck.slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    content: marked(slide.content) as string,
    index: slide.index,
  }));

  const handleLastSlide = () => {
    if (!hasTriggeredEnd) {
      setHasTriggeredEnd(true);
      trackEvent('deck_end', { deckId: deck.id });
      setShowEndModal(true);
    }
  };

  const handleCTAClick = async (cta: 'summary' | 'hub') => {
    await trackEvent('cta_click', { deckId: deck.id, cta });
    if (cta === 'summary') {
      router.push('/summary');
    } else {
      router.push('/hub');
    }
  };

  return (
    <>
      <DeckViewer slides={slides} onLastSlide={handleLastSlide} />
      <EndDeckModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onCTAClick={handleCTAClick}
      />
    </>
  );
}
