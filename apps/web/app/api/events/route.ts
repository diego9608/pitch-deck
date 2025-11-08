import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { EventSchema } from '@pd/schemas';
import { verifySession } from '@pd/auth';

// Force Node.js runtime for crypto and Prisma
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = EventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, payload } = validation.data;

    // Get session from cookie
    const cookieSecret = process.env.COOKIE_SECRET;
    const sessionCookie = request.cookies.get('deck_session')?.value;

    let sessionData = null;
    if (cookieSecret && sessionCookie) {
      sessionData = verifySession(sessionCookie, cookieSecret);
    }

    // Create event
    await prisma.event.create({
      data: {
        name,
        payload: (payload || {}) as Prisma.InputJsonValue,
        sessionId: sessionData?.sessionId || null,
        deckId: sessionData?.deckId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
