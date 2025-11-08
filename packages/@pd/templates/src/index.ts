export interface Slide {
  id: string;
  title: string;
  content: string;
  index: number;
}

export interface DeckTemplate {
  name: string;
  slides: Slide[];
}

export const baseDeckTemplate: DeckTemplate = {
  name: 'Investor Pitch Deck',
  slides: [
    { id: '1', title: 'Título', content: '# [Company Name]\n\n## [Tagline]', index: 0 },
    { id: '2', title: 'Problema', content: '# El Problema\n\n- Point 1\n- Point 2\n- Point 3', index: 1 },
    { id: '3', title: 'Solución', content: '# Nuestra Solución\n\n[Description]', index: 2 },
    { id: '4', title: 'SKUs', content: '# Productos (SKUs)\n\n- SKU 1\n- SKU 2\n- SKU 3', index: 3 },
    { id: '5', title: 'Mercado', content: '# Oportunidad de Mercado\n\n[Market size and TAM]', index: 4 },
    { id: '6', title: 'Modelo de Negocio', content: '# Modelo de Negocio\n\n[Revenue streams]', index: 5 },
    { id: '7', title: 'Unit Economics', content: '# Unit Economics\n\n[Key metrics]', index: 6 },
    { id: '8', title: 'Operación', content: '# Fases de Operación\n\n1. Phase 1\n2. Phase 2\n3. Phase 3', index: 7 },
    { id: '9', title: 'Suministro', content: '# Cadena de Suministro\n\n[Supply chain details]', index: 8 },
    { id: '10', title: 'Cumplimiento', content: '# Cumplimiento Regulatorio\n\n[Compliance info]', index: 9 },
    { id: '11', title: 'Roadmap', content: '# Roadmap\n\n- Q1 2025\n- Q2 2025\n- Q3 2025', index: 10 },
    { id: '12', title: 'Tracción', content: '# Tracción\n\n[Traction metrics]', index: 11 },
    { id: '13', title: 'Equipo', content: '# Equipo\n\n[Team bios]', index: 12 },
    { id: '14', title: 'Ventaja', content: '# Ventaja Competitiva\n\n[Competitive moat]', index: 13 },
    { id: '15', title: 'Proyecciones', content: '# Proyecciones Financieras\n\n[Financial projections]', index: 14 },
    { id: '16', title: 'Uso de Fondos', content: '# Uso de Fondos\n\n[Fund allocation]', index: 15 },
    { id: '17', title: 'Ronda', content: '# La Ronda\n\n[Round details]', index: 16 },
    { id: '18', title: 'Riesgos', content: '# Riesgos\n\n[Key risks]', index: 17 },
    { id: '19', title: 'Cierre', content: '# Gracias\n\n[Contact info]', index: 18 },
  ],
};
