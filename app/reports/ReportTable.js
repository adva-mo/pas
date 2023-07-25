"use client";
import React, { useState } from "react";
import SearchForm from "./SearchForm";

function ReportTable({ attendacesOfMonth, users, projects }) {
  const [dataToDisplay, setDataToDisplay] = useState(attendacesOfMonth);

  const getUserName = (userId) => {
    return users.find((user) => user.id === userId).name;
  };
  const getProjectName = (projectId) => {
    return projects.find((project) => project.id === projectId).name;
  };

  return (
    <>
      <SearchForm
        users={users}
        projects={projects}
        setDataToDisplay={setDataToDisplay}
      />
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
                    {dataToDisplay.map((attendance) => (
                      <tr key={attendance.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 ">
                          {getUserName(attendance.employeeId)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {getProjectName(attendance.projectId)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {attendance.production}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {attendance.payment}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {attendance.notes}
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

export default ReportTable;
