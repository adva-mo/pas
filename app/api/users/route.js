import { NextResponse } from "next/server";
import { createUser, getUsers } from "@/lib/prisma/users";

export async function GET(req) {
  try {
    const { users, error } = await getUsers();
    if (error) throw new Error(error);
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    //todo: send feedback of no body in req
    const { user, error } = await createUser(data);
    if (error) throw new Error(error);
    return NextResponse.json({ user });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
