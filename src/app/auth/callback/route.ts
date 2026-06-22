import { NextResponse, type NextRequest } from "next/server";
import { createServerRepositories } from "@/repositories/server";

const DEFAULT_REDIRECT_PATH = "/dashboard";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirectPath = next?.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_REDIRECT_PATH;

  if (code) {
    const { authRepository } = await createServerRepositories();
    await authRepository.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
