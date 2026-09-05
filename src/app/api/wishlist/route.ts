// ============================================================
// API WISHLIST — CRUD items (session based)
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SESSION_COOKIE = "papelillo_wishlist_sid";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  const sid = getSessionId(req);
  await db.wishlistItem.upsert({
    where: { sessionId_productId: { sessionId: sid, productId } },
    update: {},
    create: { sessionId: sid, productId },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sid, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax" });
  return res;
}

export async function DELETE(req: NextRequest) {
  const { productId } = await req.json();
  const sid = getSessionId(req);
  await db.wishlistItem.deleteMany({ where: { sessionId: sid, productId } });
  return NextResponse.json({ ok: true });
}

function getSessionId(req: NextRequest): string {
  const cookie = req.cookies.get(SESSION_COOKIE);
  if (cookie?.value) return cookie.value;
  return `anon_${crypto.randomUUID().slice(0, 8)}`;
}
