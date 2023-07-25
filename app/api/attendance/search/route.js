import { NextResponse } from "next/server";
import { searchAttendace } from "@/lib/prisma/attendance";

//TODO fix issue with the dates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const pid = searchParams.get("pid");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filtered = await searchAttendace(
      uid,
      pid,
      "",
      ""
      // endDate ? new Date(endDate) : ""
    );

    return NextResponse.json({ attendances: filtered });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
