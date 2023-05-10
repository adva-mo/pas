import { getProjects } from "@/lib/prisma/projects";
import { getUsers } from "@/lib/prisma/users";
import AttendanceForm from "./AttendanceForm.js";

async function newAttendance() {
  const usersData = getUsers();
  const projectsData = getProjects();

  const [users, projects] = await Promise.all([usersData, projectsData]);

  return <AttendanceForm users={users.users} projects={projects.projects} />;
}

export default newAttendance;
