import { NextResponse } from "next/server";
import { searchAttendace } from "@/lib/prisma/attendance";

//TODO convert this route to /search?uid=?pid
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const pid = searchParams.get("pid");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    // console.log(uid);
    // console.log(pid);

    const filtered = await searchAttendace(
      uid,
      pid,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    return NextResponse.json({ attendances: filtered });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
