import React, { useEffect, useRef, useState } from 'react';

export interface Slide {
  id: string;
  title: string;
  content: string;
  index: number;
}

interface DeckViewerProps {
  slides: Slide[];
  onLastSlide?: () => void;
}

export function DeckViewer({ slides, onLastSlide }: DeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt fullscreen on mount
    const attemptFullscreen = async () => {
      if (containerRef.current && document.fullscreenEnabled) {
        try {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.log('Fullscreen not available:', err);
        }
      }
    };
    attemptFullscreen();

    // Keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    // Check if we're on the last slide
    if (currentSlide === slides.length - 1 && onLastSlide) {
      onLastSlide();
    }
  }, [currentSlide, slides.length, onLastSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      className="deck-viewer relative w-full h-screen bg-[var(--color-bg)] flex items-center justify-center"
    >
      {/* Slide Content */}
      <div className="slide-content max-w-5xl w-full px-8 text-center">
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: slide.content }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-[var(--color-glass-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-fg)] disabled:opacity-50 hover:bg-[var(--color-secondary)] transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Diapositiva anterior"
        >
          ←
        </button>
        <span className="text-[var(--color-fg)] min-w-[100px] text-center">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 bg-[var(--color-glass-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-fg)] disabled:opacity-50 hover:bg-[var(--color-secondary)] transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Diapositiva siguiente"
        >
          →
        </button>
      </div>

      {/* Fullscreen Toggle */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-8 right-8 px-4 py-2 bg-[var(--color-glass-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-fg)] hover:bg-[var(--color-secondary)] transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Pantalla completa"
        >
          ⛶
        </button>
      )}
    </div>
  );
}
