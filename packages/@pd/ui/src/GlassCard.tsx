import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`glass-card backdrop-blur-[var(--blur)] bg-[var(--color-glass-bg)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] ${className}`}
    >
      {children}
    </div>
  );
}
