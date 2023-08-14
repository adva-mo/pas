"use client";
import React, { useState } from "react";
import SearchForm from "./SearchForm";

function ReportTable({ attendacesOfMonth, users, projects }) {
  const [dataToDisplay, setDataToDisplay] = useState(
    attendacesOfMonth.map((item) => {
      item.payment = Number(item.payment);
      return item;
    })
  );

  const totalPayment = dataToDisplay.reduce((acc, item) => {
    return acc + item.payment;
  }, 0);

  const getUserName = (userId) => {
    return users.find((user) => user.id === userId).name;
  };
  const getProjectName = (projectId) => {
    return projects.find((project) => project.id === projectId).name;
  };

  return (
    <div
      className="max-w-screen-sm min-h-screen px-2 mx-auto overflow-x-scroll sm:px-4 lg:px-8"
      dir="rtl"
    >
      <SearchForm
        users={users}
        projects={projects}
        setDataToDisplay={setDataToDisplay}
      />
      <div className="flow-root mx-auto mt-8 overflow-x-auto ">
        <div className="inline-block min-w-full px-2 py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full text-right divide-y divide-slate-300">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    שם העובד
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    פרוייקט
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    תאריך
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    מספר גלישות
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    הערות
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-start text-sm font-semibold min-w-fit text-slate-900"
                  >
                    תשלום
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {dataToDisplay.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium whitespace-nowrap min-w-fit text-slate-900 ">
                      {getUserName(attendance.employeeId)}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap min-w-fit text-slate-500">
                      {getProjectName(attendance.projectId)}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap min-w-fit text-slate-500">
                      {attendance.date.split("T")[0]}
                      {/* {attendance.date.toLocaleDateString()} */}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap min-w-fit text-slate-500">
                      {attendance.production}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap min-w-fit text-slate-500">
                      {attendance.notes}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap min-w-fit text-slate-500">
                      {attendance.payment}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <th className="px-3 py-4 text-base font-semibold min-w-fit whitespace-nowrap text-slate-500">
                    סה״כ לתשלום
                  </th>
                  <td>
                    <span className="text-base font-semi bold min-w-fit whitespace-nowrap text-slate-700">
                      {totalPayment}
                    </span>
                    &#8362;
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportTable;
