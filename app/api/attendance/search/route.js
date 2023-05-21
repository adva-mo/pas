import { NextResponse } from "next/server";
import { getAttendanceById } from "@/lib/prisma/attendance";

//TODO convert this route to /search?uid=?pid
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const pid = searchParams.get("pid");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filtered = await getAttendanceById(uid, pid, from, to);

    return NextResponse.json({ attendances: filtered });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
