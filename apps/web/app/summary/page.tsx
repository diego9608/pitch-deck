import { marked } from 'marked';

const executiveSummary = `
# Resumen Ejecutivo

## Oportunidad

Maquila de Agua presenta una oportunidad única en el mercado de agua embotellada premium con un ancla comercial de más de 900 tiendas confirmadas.

## El Problema

- Demanda creciente de agua purificada premium
- Cadenas de retail buscan marcas propias de calidad
- Alto costo de establecer operación propia de embotellado

## Nuestra Solución

Ofrecemos servicios completos de maquila para marcas de agua, incluyendo:

- Embotellado y purificación certificada
- Diseño y producción de etiquetas
- Logística y distribución
- Cumplimiento regulatorio completo

## Productos (SKUs)

1. **Botella 500ml** - Formato individual premium
2. **Botella 1.5L** - Formato familiar
3. **Garrafón 20L** - Formato institucional/hogar

## Modelo de Negocio

- Ingresos por volumen embotellado
- Contratos anuales con clientes ancla
- Margen bruto: 35-40%
- Margen operativo objetivo: 20%

## Tracción

- Ancla confirmado: >900 tiendas
- Pipeline adicional: 5 clientes potenciales
- Capacidad instalada: 2M litros/mes
- Timeline: operación en Q2 2025

## Ronda

Buscamos **$500K USD** para:
- Completar certificaciones (COFEPRIS, ISO)
- Capital de trabajo inicial
- Equipamiento adicional
- Marketing y ventas

## Equipo

Equipo fundador con 15+ años de experiencia combinada en manufactura, operaciones y retail.

## Siguiente Pasos

1. Finalizar due diligence con inversionistas
2. Cerrar ronda Seed
3. Completar certificaciones regulatorias
4. Iniciar operaciones comerciales Q2 2025

---

Para más información, explore nuestro [Pitch Deck completo](/deck/default-deck-id) o visite el [Centro de Recursos](/hub).
`;

export default async function SummaryPage() {
  const htmlContent = await marked(executiveSummary);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex gap-4 justify-center">
          <a
            href="/hub"
            className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold rounded-[var(--radius-lg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[44px] inline-flex items-center"
          >
            Explorar Documentos
          </a>
          <a
            href="/deck/default-deck-id"
            className="px-6 py-3 border border-[var(--color-border)] hover:bg-[var(--color-glass-bg)] text-[var(--color-fg)] font-semibold rounded-[var(--radius-lg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[44px] inline-flex items-center"
          >
            Ver Pitch Deck
          </a>
        </div>
      </div>
    </main>
  );
}
