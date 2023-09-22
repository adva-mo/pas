"use client";
import { useRef } from "react";
import axios from "axios";

function ProjectForm({ clients }) {
  const formRef = useRef();

  const saveProject = async () => {
    try {
      const newProject = Object.fromEntries(new FormData(formRef.current));
      await axios.post(`${process.env.BASE_URL}/api/projects`, newProject);
      formRef.current.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      dir="ltr"
      className="flex flex-col items-end max-w-screen-sm gap-3 p-4 mx-auto mt-4 font-sans text-lg rounded-md text-slate-800"
      ref={formRef}
    >
      <div>
        {/* {clients && console.log(clients)} */}
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="name"
        >
          פרוייקט
        </label>
        <input
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
          dir="rtl"
          name="name"
          placeholder="שם הפרוייקט..."
        />
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="adress"
        >
          כתובת
        </label>
        <input
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
          name="adress"
          dir="rtl"
          placeholder="כתובת הפרוייקט..."
        />
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="clientId"
        >
          לקוח
        </label>
        <select
          name="clientId"
          dir="rtl"
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
        >
          <option className="w-32 px-2" value={"בחר לקוח"}>
            בחר לקוח
          </option>
          {clients?.map((c) => (
            <option key={`${c.id}key`} className="w-32 px-2" value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="block font-semibold leading-4 text-right text-md text-slate-600"
          htmlFor="startedAt"
        >
          נפתח בתאריך
        </label>
        <input
          className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
          name="startedAt"
          type="date"
        />
      </div>
      <button
        className="self-center my-4 transition-shadow duration-200 ease-in-out shadow-sm btn-primary hover:shadow-md focus:shadow-md active:shadow-sm"
        onClick={() => saveProject()}
      >
        שמירה
      </button>
    </form>
  );
}
export default ProjectForm;
