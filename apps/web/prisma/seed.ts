import { PrismaClient } from '@prisma/client';
import { baseDeckTemplate } from '@pd/templates';

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

  // Create deck
  const deck = await prisma.deck.upsert({
    where: { id: 'default-deck-id' },
    update: {},
    create: {
      id: 'default-deck-id',
      projectId: project.id,
      title: baseDeckTemplate.name,
      status: 'PUBLISHED',
      visibility: 'INVITE_ONLY',
    },
  });

  console.log('✅ Created deck:', deck.title);

  // Create slides
  for (const slide of baseDeckTemplate.slides) {
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

  console.log('✅ Created slides:', baseDeckTemplate.slides.length);

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
