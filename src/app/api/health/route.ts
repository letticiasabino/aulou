import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "app",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
}
