import { NextResponse } from "next/server";
import { createAttendance } from "@/lib/prisma/attendance";

export async function POST(req) {
  try {
    const data = await req.json();
    //todo: send feedback of no body in req
    const { attendance, error } = await createAttendance(data);
    if (error) throw new Error(error);
    return NextResponse.json({ attendance });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
