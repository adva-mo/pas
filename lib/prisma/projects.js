import prisma from ".";

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany();
    return projects;
  } catch (error) {
    return error;
  }
}

export async function createProject(projectData) {
  //todo send feedback of missing fields
  try {
    const project = await prisma.project.create({ data: projectData });
    return { project };
  } catch (error) {
    return { error };
  }
}
