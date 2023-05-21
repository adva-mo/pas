import { NextResponse } from "next/server";
import { getAttendanceById } from "@/lib/prisma/attendance";

//TODO convert this route to /search?uid=?pid
export async function GET(request, { params }) {
  try {
    const { uid } = params;
    const { attendances, error } = await getAttendanceById(uid);
    if (error) throw new Error(error);
    return NextResponse.json({ attendances });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}

//uid
//pid
//from
//to
