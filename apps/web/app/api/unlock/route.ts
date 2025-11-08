export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

export async function POST(req: Request) {
  const { key, consent } = await req.json();
  if (!consent?.ndaAccepted) return NextResponse.json({ ok:false }, { status: 400 });

  const expected = process.env.DECK_PASS || "";
  if (!expected) return NextResponse.json({ ok:false, err:"missing env" }, { status: 500 });

  const ok = key
    && expected
    && key.length === expected.length
    && timingSafeEqual(Buffer.from(key), Buffer.from(expected));

  if (!ok) return NextResponse.json({ ok:false }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set("deck_session","1",{ httpOnly:true, secure:true, sameSite:"lax", path:"/", maxAge:60*60*24 });
  return NextResponse.json({ ok:true });
}
