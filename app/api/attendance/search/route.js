import { NextResponse } from "next/server";
import { searchAttendace } from "@/lib/prisma/attendance";
export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    const url = new URL(req.url);

    const skip = url.searchParams.get("skip");
    const take = url.searchParams.get("take");

    const { searchParams } = new URL(req.url);
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
