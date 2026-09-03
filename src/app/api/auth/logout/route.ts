// API route: POST /api/auth/logout — cierra sesión del admin
import { logoutAction } from "@/app/actions";

export const runtime = "nodejs";

export async function POST() {
  try {
    await logoutAction();
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
