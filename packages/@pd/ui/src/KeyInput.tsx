'use client';

import React, { useState } from 'react';

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  error?: string;
}

export function KeyInput({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
}: KeyInputProps) {
  const [focused, setFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Ingrese la clave de acceso"
          className={`w-full px-4 py-3 bg-[var(--color-bg)] border ${
            error
              ? 'border-red-500'
              : focused
              ? 'border-[var(--color-accent)]'
              : 'border-[var(--color-border)]'
          } rounded-[var(--radius-lg)] text-[var(--color-fg)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-glass-bg)] transition-all caret-[var(--color-accent)] animate-blink`}
          aria-label="Clave de acceso"
          aria-invalid={!!error}
          aria-describedby={error ? 'key-error' : undefined}
        />
      </div>
      {error && (
        <p
          id="key-error"
          className="mt-2 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
