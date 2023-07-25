"use client";
import axios from "axios";
import React, { useEffect, useRef } from "react";

function SearchForm({ projects, users, setDataToDisplay }) {
  const userRef = useRef("");
  const projectRef = useRef("");

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(
        `/api/attendance/search?uid=${userRef.current.value || ""}&pid=${
          projectRef.current.value || ""
        }`
        // &startDate=""&endDate=""`
      );
      console.log(data.attendances);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <select
        dir="rtl"
        name="projectId"
        className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        ref={projectRef}
      >
        <option className="w-32 px-2">לפי פרוייקט</option>
        {projects?.map((project) => (
          <option className="w-32 px-2" key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <select
        name="employeeId"
        dir="rtl"
        className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        ref={userRef}
      >
        <option className="w-32 px-2">בחר עובד</option>
        {users?.map((user) => (
          <option className="w-32 px-2" key={user.id} value={user.id}>
            {user.name}{" "}
          </option>
        ))}
      </select>
      <button onClick={() => handleSearch()}>חיפוש</button>
    </form>
  );
}

export default SearchForm;
