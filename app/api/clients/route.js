import { NextResponse } from "next/server";
import { createClient, getClients } from "@/lib/prisma/clients";

export async function GET(req) {
  try {
    const { clients, error } = await getClients();
    if (error) throw new Error(error);
    return NextResponse.json({ clients });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    //todo: send feedback of no body in req
    const { client, error } = await createClient(data);
    if (error) throw new Error(error);
    return NextResponse.json({ client });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
