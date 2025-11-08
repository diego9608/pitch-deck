import { HubGrid, HubLink } from '@pd/ui';

const hubLinks: HubLink[] = [
  {
    title: 'Pitch Deck',
    description: 'Presentación completa para inversionistas',
    href: '/deck/default-deck-id',
    icon: '📊',
  },
  {
    title: 'Resumen Ejecutivo',
    description: 'Vista general del proyecto y oportunidad',
    href: '/summary',
    icon: '📄',
  },
  {
    title: 'Memo de Inversión',
    description: 'Análisis detallado de la oportunidad',
    href: '#',
    icon: '💼',
  },
  {
    title: 'Uso de Fondos',
    description: 'Distribución detallada de la inversión',
    href: '#',
    icon: '💰',
  },
  {
    title: 'Roadmap',
    description: 'Hitos y plan de ejecución',
    href: '#',
    icon: '🗺️',
  },
  {
    title: 'Cumplimiento',
    description: 'Documentación regulatoria y compliance',
    href: '#',
    icon: '✅',
  },
];

export default function HubPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-fg)] mb-4">
            Centro de Recursos
          </h1>
          <p className="text-[var(--color-fg)] opacity-75 text-lg">
            Acceda a toda la documentación y materiales del proyecto
          </p>
        </div>

        <HubGrid links={hubLinks} />

        <div className="mt-12 text-center">
          <p className="text-[var(--color-fg)] opacity-60 text-sm">
            ¿Preguntas? Contáctenos en{' '}
            <a
              href="mailto:contact@agua.com"
              className="text-[var(--color-accent)] hover:text-[var(--color-primary)] underline"
            >
              contact@agua.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
