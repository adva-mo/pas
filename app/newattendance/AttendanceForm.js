"use client";
import { useRef } from "react";
import axios from "axios";

function AttendanceForm({ users, projects }) {
  const formRef = useRef();

  const saveAttendance = async () => {
    try {
      const newAttendance = Object.fromEntries(new FormData(formRef.current));
      formRef.current.reset();
      const { data } = await axios.post(
        "http://localhost:3000/api/attendance",
        {
          ...newAttendance,
          payment: Number(newAttendance.payment),
          date: new Date(newAttendance.date),
        }
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      dir="ltr"
      className="flex flex-col items-end max-w-screen-sm gap-3 p-4 mx-auto mt-4 font-sans text-lg rounded-md text-slate-800"
      ref={formRef}
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label
          htmlFor="employeeId"
          className="block font-semibold leading-4 text-right text-md text-slate-600"
        >
          עובד
        </label>
        <select
          name="employeeId"
          dir="rtl"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        >
          <option className="w-32 px-2">בחר עובד</option>
          {users?.map((user) => (
            <option className="w-32 px-2" key={user.id} value={user.id}>
              {user.name}{" "}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="projectId"
        >
          פרוייקט
        </label>
        <select
          dir="rtl"
          name="projectId"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        >
          <option className="w-32 px-2">בחר פרוייקט</option>
          {projects?.map((project) => (
            <option className="w-32 px-2" key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="date"
        >
          תאריך
        </label>
        <input
          type="date"
          name="date"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        />
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="production"
        >
          הספק
        </label>
        <input
          placeholder="מספר גלישות..."
          dir="rtl"
          name="production"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        />
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="payment"
        >
          תשלום יומי
        </label>
        <input
          placeholder="סה״כ יומי לתשלום (₪)"
          dir="rtl"
          typeof="int"
          name="payment"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        />
      </div>
      <div className="w-full">
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="notes"
        >
          הערות
        </label>
        <textarea
          dir="rtl"
          rows="4"
          name="notes"
          className="block w-full min-w-[320px] py-2 px-3 mt-2 text-slate-700 border rounded-md ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-700"
        />
      </div>
      <button
        className="self-center my-4 transition-shadow duration-200 ease-in-out shadow-sm btn-primary hover:shadow-md focus:shadow-md active:shadow-sm"
        onClick={() => saveAttendance()}
      >
        שמירה
      </button>
    </form>
  );
}

export default AttendanceForm;
