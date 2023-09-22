"use client";
import axios from "axios";
import { useRef } from "react";
import PageHeader from "../UI/pageHeader/Pageheader.js";

export default function NewUser() {
  const oidRef = useRef();
  const nameRef = useRef();

  const saveUser = async () => {
    try {
      const newUser = {
        oid: Number(oidRef.current.value),
        name: nameRef.current.value,
        password: oidRef.current.value,
      };
      await axios.post(`${process.env.BASE_URL}/api/users`, newUser);
      nameRef.current.value = "";
      oidRef.current.value = "";
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <PageHeader title="הוסף עובד"></PageHeader>
      <form
        dir="ltr"
        className="flex flex-col items-end max-w-screen-sm gap-3 p-4 mx-auto mt-4 font-sans text-lg rounded-md text-slate-800"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block font-semibold leading-4 text-right text-md text-slate-600">
            שם
          </label>
          <input
            className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
            dir="rtl"
            ref={nameRef}
            placeholder="שם העובד..."
          />
        </div>
        <div>
          <label className="block font-semibold leading-4 text-right text-md text-slate-600">
            ת.ז
          </label>
          <input
            className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
            dir="rtl"
            ref={oidRef}
            placeholder="מספר זהות (כולל בפרת ביקורת)"
            type="text"
            pattern="\d*"
          />
        </div>
        <button
          className="self-center my-4 transition-shadow duration-200 ease-in-out shadow-sm btn-primary hover:shadow-md focus:shadow-md active:shadow-sm"
          onClick={() => saveUser()}
        >
          שמירה
        </button>
      </form>
    </>
  );
}
