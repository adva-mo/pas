"use client";
import axios from "axios";
import React, { useState } from "react";

function SearchForm({ projects, users, setDataToDisplay }) {
  const [employee, setEmployee] = useState("");
  const [project, setProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(
        `/api/attendance/search?uid=${employee}&pid=${project}&startDate=${startDate}&endDate=${endDate}`
      );
      setDataToDisplay(data.attendances);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form dir="rtl" onSubmit={(e) => e.preventDefault()}>
      <h1 className="py-3 text-3xl font-bold tracking-wide text-center">
        חיפוש דיווחים
      </h1>
      <div className="flex flex-col items-center justify-between ">
        <select
          dir="rtl"
          name="projectId"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-700"
          onChange={(e) => setProject(e.target.value)}
        >
          <option className="w-32 px-2" value={""}>
            לפי פרוייקט
          </option>
          {projects?.map((project) => (
            <option className="w-32 px-2" key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          name="employeeId"
          dir="rtl"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-700"
          onChange={(e) => setEmployee(e.target.value)}
        >
          <option className="w-32 px-2" value={""}>
            בחר עובד
          </option>
          {users?.map((user) => (
            <option className="w-32 px-2" key={user.id} value={user.id}>
              {user.name}{" "}
            </option>
          ))}
        </select>

        <div className="grid items-center w-full grid-cols-1 md:grid-cols-2 justify-evenly">
          <div className="flex items-center justify-between w-full col-span-1">
            <label
              htmlFor="startDate"
              className="inline-block px-4 text-base font-medium text-slate-900"
            >
              מתאריך
            </label>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              name="startDate"
              id="startDate"
              className="px-3 py-2 mt-2 border rounded-md ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-700"
            />
          </div>
          <div className="flex items-center justify-between w-full col-span-1">
            <label
              htmlFor="endDate"
              className="inline-block px-4 text-base font-medium text-slate-900"
            >
              עד תאריך
            </label>
            <input
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              name="endDate"
              id="endDate"
              className="px-3 py-2 mt-2 border rounded-md ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-700"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSearch()}
          className="w-28 mt-3 rounded-md bg-white px-3.5 py-2.5 text-lg font-bold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          חיפוש
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
