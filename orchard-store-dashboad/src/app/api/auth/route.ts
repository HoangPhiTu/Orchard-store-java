import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Proxy auth handler not yet implemented" }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Logout handler not yet implemented" }, { status: 501 });
}
