// API route: POST /api/auth/change-username
import { changeUsernameAction } from "@/app/actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    const formData = new FormData();
    formData.set("username", username);
    const result = await changeUsernameAction(formData);
    return Response.json(result);
  } catch {
    return Response.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
