import PageHeader from "../UI/pageHeader/Pageheader";
import { searchAttendace } from "@/lib/prisma/attendance.js";

async function reports() {
  const currentDate = new Date();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const attendacesOfMonth = await searchAttendace("", "", firstDayOfMonth, "");
  return (
    <>
      {console.log(attendacesOfMonth)}
      <PageHeader title={"דוחות"}></PageHeader>
    </>
  );
}

export default reports;
