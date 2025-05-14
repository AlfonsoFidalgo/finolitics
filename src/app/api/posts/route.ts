import { NextResponse } from "next/server";

export const config = {
  schedule: "* * * * *", // Every day at 9:00 AM UTC
};

export async function GET() {
  return NextResponse.json({ ok: "all good man" });
}
