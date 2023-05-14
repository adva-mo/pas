import { getClients } from "@/lib/prisma/clients";
import ProjectForm from "./ProjectForm";

async function newProject() {
  const clients = await getClients();

  return <ProjectForm clients={clients} />;
}

export default newProject;
