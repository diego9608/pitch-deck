import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import DeckViewerClient from './DeckViewerClient';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DeckPage({ params }: PageProps) {
  const { id } = params;

  // Fetch deck and slides
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      slides: {
        orderBy: { index: 'asc' },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  return <DeckViewerClient deck={deck} />;
}
