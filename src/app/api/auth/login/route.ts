// API route: POST /api/auth/login — autentica contra Prisma/Neón
import { loginAction } from "@/app/actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const formData = new FormData();
    formData.set("username", username);
    formData.set("password", password);
    const result = await loginAction(formData);
    if (result.success) {
      return Response.json({ success: true, session: result });
    }
    return Response.json({ success: false, error: result.error }, { status: 401 });
  } catch (e) {
    return Response.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
