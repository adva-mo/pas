import { NextResponse } from "next/server";
import { searchAttendace } from "@/lib/prisma/attendance";

//TODO fix issue with the dates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const pid = searchParams.get("pid");
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    startDate = startDate ? new Date(startDate) : null;
    endDate = endDate ? new Date(endDate) : null;

    const filtered = await searchAttendace(uid, pid, startDate, endDate);

    return NextResponse.json({ attendances: filtered });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
