import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: process.env.DEFAULT_WORKSPACE_SLUG || 'agua' },
    update: {},
    create: {
      slug: process.env.DEFAULT_WORKSPACE_SLUG || 'agua',
      name: 'Agua Maquila',
      owner: {
        create: {
          email: 'owner@agua.com',
          name: 'Owner',
        },
      },
    },
  });

  console.log('✅ Created workspace:', workspace.slug);

  // Create default project
  const project = await prisma.project.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: process.env.DEFAULT_PROJECT_SLUG || 'maquila-agua',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      slug: process.env.DEFAULT_PROJECT_SLUG || 'maquila-agua',
      name: 'Maquila de Agua - Investor Pitch',
      description: 'Water bottling maquila opportunity',
    },
  });

  console.log('✅ Created project:', project.slug);

  // Create deck with basic slides
  const deck = await prisma.deck.upsert({
    where: { id: 'default-deck-id' },
    update: {},
    create: {
      id: 'default-deck-id',
      projectId: project.id,
      title: 'Agua Maquila Pitch Deck',
      status: 'PUBLISHED',
      visibility: 'INVITE_ONLY',
    },
  });

  console.log('✅ Created deck:', deck.title);

  // Create basic slides
  const basicSlides = [
    { index: 0, title: 'Intro', content: '# Welcome to Agua Maquila\n\nWater bottling maquila opportunity' },
    { index: 1, title: 'Problem', content: '# The Problem\n\nDescribe the problem here' },
    { index: 2, title: 'Solution', content: '# Our Solution\n\nDescribe the solution here' },
  ];

  for (const slide of basicSlides) {
    await prisma.slide.upsert({
      where: {
        deckId_index: {
          deckId: deck.id,
          index: slide.index,
        },
      },
      update: {},
      create: {
        deckId: deck.id,
        index: slide.index,
        title: slide.title,
        content: slide.content,
      },
    });
  }

  console.log('✅ Created slides:', basicSlides.length);

  // Create invite with gate
  const invite = await prisma.invite.upsert({
    where: { code: 'demo' },
    update: {},
    create: {
      deckId: deck.id,
      code: 'demo',
      gateHashSha256: process.env.DECK_GATE_HASH || '',
      isActive: true,
    },
  });

  console.log('✅ Created invite:', invite.code);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
