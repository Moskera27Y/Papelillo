// ============================================================
// WISHLIST SERVICE — Prisma client + session cache
// ============================================================
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const WISHLIST_SESSION_KEY = "papelillo_wishlist_session";

// Server-side session (for SSR pages that need wishlist count)
export async function getWishlistItems(sessionId?: string) {
  const sid = sessionId || getSessionId();
  return prisma.wishlistItem.findMany({
    where: { sessionId: sid },
    include: { product: true },
  });
}

export async function addToWishlist(productId: string, sessionId?: string) {
  const sid = sessionId || getSessionId();
  const item = await prisma.wishlistItem.upsert({
    where: { sessionId_productId: { sessionId: sid, productId } },
    update: {},
    create: { sessionId: sid, productId },
  });
  revalidatePath("/wishlist");
  return item;
}

export async function removeFromWishlist(productId: string, sessionId?: string) {
  const sid = sessionId || getSessionId();
  await prisma.wishlistItem.deleteMany({ where: { sessionId: sid, productId } });
  revalidatePath("/wishlist");
}

export function getSessionId(): string {
  return WISHLIST_SESSION_KEY;
}
