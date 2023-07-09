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
      <div className="px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="mx-2 mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-300 text-right">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold text-slate-900"
                      >
                        שם העובד
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-start text-sm font-semibold text-slate-900"
                      >
                        פרוייקט
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-start text-sm font-semibold text-slate-900"
                      >
                        מספר גלישות
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-start text-sm font-semibold text-slate-900"
                      >
                        תשלום
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-start text-sm font-semibold text-slate-900"
                      >
                        הערות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {attendacesOfMonth.map((employee) => (
                      <tr key={employee.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 ">
                          {employee.employeeId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {employee.projectId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {employee.production}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {employee.payment}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {employee.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default reports;
