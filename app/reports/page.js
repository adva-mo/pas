import PageHeader from "../UI/pageHeader/Pageheader";
import { searchAttendace } from "@/lib/prisma/attendance.js";
import { getUsers } from "@/lib/prisma/users";
import { getProjects } from "@/lib/prisma/projects";
import ReportTable from "./ReportTable";

async function reports() {
  const usersData = getUsers();
  const projectsData = getProjects();
  const [users, projects] = await Promise.all([usersData, projectsData]);

  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const attendacesOfMonth = await searchAttendace("", "", firstDayOfMonth, "");
  return (
    <>
      <PageHeader title={"דוחות"}></PageHeader>
      <ReportTable
        attendacesOfMonth={attendacesOfMonth}
        users={users.users}
        projects={projects.projects}
      />
    </>
  );
}

export default reports;
