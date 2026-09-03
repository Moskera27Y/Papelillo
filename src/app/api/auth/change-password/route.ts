// API route: POST /api/auth/change-password
import { changePasswordAction } from "@/app/actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = await changePasswordAction(formData);
  return Response.json(result);
}
