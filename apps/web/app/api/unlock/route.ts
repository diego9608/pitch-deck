import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UnlockRequestSchema } from '@pd/schemas';
import { constantTimeEquals, sha256, signSession, hashEmail } from '@pd/auth';
import { getNDAHash } from '@pd/legal';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = UnlockRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { key, consent } = validation.data;

    // Validate NDA acceptance
    if (!consent.ndaAccepted) {
      return NextResponse.json(
        { error: 'NDA must be accepted' },
        { status: 400 }
      );
    }

    // Compute hash of provided key
    const keyHash = sha256(key);

    // Get expected hash from environment
    const expectedHash = process.env.DECK_GATE_HASH;
    if (!expectedHash) {
      console.error('DECK_GATE_HASH not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    if (!constantTimeEquals(keyHash, expectedHash)) {
      return NextResponse.json(
        { error: 'Invalid access key' },
        { status: 401 }
      );
    }

    // Find the invite (for now, using 'demo' code - can be dynamic later)
    const invite = await prisma.invite.findUnique({
      where: { code: 'demo', isActive: true },
      include: { deck: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 }
      );
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create deck session
    const session = await prisma.deckSession.create({
      data: {
        inviteId: invite.id,
        deckId: invite.deckId,
        ndaAccepted: true,
        consentAt: new Date(),
        ip,
        userAgent,
        emailHash: consent.email ? hashEmail(consent.email) : null,
        name: consent.name || null,
      },
    });

    // Log NDA acceptance event
    const ndaHash = getNDAHash();
    await prisma.event.create({
      data: {
        sessionId: session.id,
        deckId: invite.deckId,
        name: 'nda_accepted',
        payload: {
          ndaHash,
          hasEmail: !!consent.email,
          hasName: !!consent.name,
        },
      },
    });

    // Log unlock event
    await prisma.event.create({
      data: {
        sessionId: session.id,
        deckId: invite.deckId,
        name: 'unlocked',
        payload: {
          inviteCode: invite.code,
        },
      },
    });

    // Create signed session cookie
    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret) {
      console.error('COOKIE_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const sessionPayload = {
      inviteId: invite.id,
      deckId: invite.deckId,
      sessionId: session.id,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const signedSession = signSession(sessionPayload, cookieSecret);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      deckId: invite.deckId,
    });

    response.cookies.set('deck_session', signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
