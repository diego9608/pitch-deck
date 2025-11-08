'use client';

import React, { useEffect } from 'react';

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export function NdaModal({ isOpen, onClose, content }: NdaModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nda-title"
    >
      <div
        className="glass-card max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="nda-title" className="text-2xl font-bold text-[var(--color-fg)]">
            Acuerdo de Confidencialidad (NDA)
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-3 px-6 rounded-[var(--radius-lg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
