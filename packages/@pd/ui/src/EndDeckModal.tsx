'use client';

import React from 'react';

interface EndDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCTAClick: (cta: 'summary' | 'hub') => void;
}

export function EndDeckModal({ isOpen, onClose, onCTAClick }: EndDeckModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-deck-title"
    >
      <div className="glass-card max-w-md w-full">
        <h2 id="end-deck-title" className="text-2xl font-bold text-[var(--color-fg)] mb-4">
          ¡Gracias por su tiempo!
        </h2>
        <p className="text-[var(--color-fg)] opacity-90 mb-6">
          Explore más información sobre nuestra propuesta:
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onCTAClick('summary')}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-3 px-6 rounded-[var(--radius-lg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[44px]"
          >
            Ver Resumen Ejecutivo
          </button>
          <button
            onClick={() => onCTAClick('hub')}
            className="w-full border border-[var(--color-border)] hover:bg-[var(--color-glass-bg)] text-[var(--color-fg)] font-semibold py-3 px-6 rounded-[var(--radius-lg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[44px]"
          >
            Explorar Documentos (Hub)
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 text-[var(--color-fg)] opacity-75 hover:opacity-100 transition-opacity underline text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
