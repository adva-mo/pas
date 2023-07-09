import { getClients } from "@/lib/prisma/clients";
import ProjectForm from "./ProjectForm";
import PageHeader from "../UI/pageHeader/Pageheader";

async function newProject() {
  const clients = await getClients();

  return (
    <>
      <PageHeader title="פתח פרוייקט"></PageHeader>
      <ProjectForm clients={clients} />;
    </>
  );
}

export default newProject;
