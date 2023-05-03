import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/prisma/projects";

export async function GET(req) {
  try {
    const { projects, error } = await getProjects();
    if (error) throw new Error(error);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(req) {
  console.log("posting projcet");
  try {
    const data = await req.json();
    //todo: send feedback of no body in req
    const { project, error } = await createProject(data);
    if (error) throw new Error(error);
    return NextResponse.json({ project });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message });
  }
}
