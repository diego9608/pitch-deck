'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GlassCard, KeyInput, NdaModal } from '@pd/ui';
import { trackEvent } from '@pd/analytics';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [key, setKey] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // For demo purposes, using placeholder NDA content
  // In production, this would be loaded from the server
  const ndaContent = `
    <h1>Acuerdo de Confidencialidad</h1>
    <p>Este acuerdo establece los términos bajo los cuales se compartirá información confidencial.</p>
    <h2>1. Definiciones</h2>
    <p>Información Confidencial significa toda la información compartida en este pitch deck.</p>
    <h2>2. Obligaciones</h2>
    <p>El receptor acuerda mantener la confidencialidad de toda la información compartida.</p>
    <h2>3. Duración</h2>
    <p>Este acuerdo tiene una duración de 3 años desde la fecha de aceptación.</p>
    <h2>4. Ley Aplicable</h2>
    <p>Este acuerdo se rige por las leyes de México.</p>
  `;

  const handleSubmit = async () => {
    setError('');

    if (!key) {
      setError('Por favor ingrese la clave de acceso');
      return;
    }

    if (!ndaAccepted) {
      setError('Debe aceptar el NDA para continuar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          consent: {
            ndaAccepted: true,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al validar la clave');
        setLoading(false);
        return;
      }

      // Track successful unlock
      await trackEvent('unlock_success', { code });

      // Redirect to deck
      router.push(`/deck/${data.deckId}`);
    } catch (err) {
      console.error('Unlock error:', err);
      setError('Error de conexión. Por favor intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-fg)] mb-2">
            Acceso Invitado
          </h1>
          <p className="text-[var(--color-fg)] opacity-75">
            Ingrese su clave de acceso para ver el pitch deck
          </p>
        </div>

        <KeyInput
          value={key}
          onChange={setKey}
          onSubmit={handleSubmit}
          disabled={loading}
          error={error}
        />

        <div className="mt-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={ndaAccepted}
              onChange={(e) => setNdaAccepted(e.target.checked)}
              disabled={loading}
              className="mt-1 w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-glass-bg)] cursor-pointer"
              aria-label="Acepto el NDA"
            />
            <span className="text-sm text-[var(--color-fg)] flex-1">
              Acepto el{' '}
              <button
                onClick={() => setShowNdaModal(true)}
                className="text-[var(--color-accent)] underline hover:text-[var(--color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-glass-bg)] rounded"
                type="button"
              >
                Acuerdo de Confidencialidad (NDA)
              </button>
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !key || !ndaAccepted}
          className="w-full mt-8 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-3 px-6 rounded-[var(--radius-lg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-glass-bg)] min-h-[44px]"
        >
          {loading ? 'Validando...' : 'Acceder'}
        </button>
      </GlassCard>

      <NdaModal
        isOpen={showNdaModal}
        onClose={() => setShowNdaModal(false)}
        content={ndaContent}
      />
    </main>
  );
}
