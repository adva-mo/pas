"use client";
import axios from "axios";
import { useRef } from "react";
import PageHeader from "../UI/pageHeader/Pageheader.js";

function NewClient() {
  const formRef = useRef();

  const saveClient = async () => {
    try {
      const newClient = Object.fromEntries(new FormData(formRef.current));
      await axios.post(`${process.env.BASE_URL}/api/clients`, {
        ...newClient,
        oid: Number(newClient.oid),
      });
      formRef.current.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <PageHeader title="הוסף לקוח"></PageHeader>
      <form
        dir="ltr"
        className="flex flex-col items-end max-w-screen-sm gap-3 p-4 mx-auto mt-4 font-sans text-lg rounded-md text-slate-800"
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label
            className="block font-semibold leading-4 text-right text-md text-slate-600"
            htmlFor="oid"
          >
            ח.פ.
          </label>
          <input
            className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
            dir="rtl"
            placeholder="מספר ח.פ..."
            name="oid"
          ></input>
        </div>
        <div>
          <label
            className="block font-semibold leading-4 text-right text-md text-slate-600"
            htmlFor="name"
          >
            שם
          </label>
          <input
            className="block w-full min-w-[256px] py-2 px-3 mt-2  border rounded-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-700"
            dir="rtl"
            placeholder="שם הלקוח..."
            name="name"
          ></input>
        </div>
        <button
          className="self-center my-4 transition-shadow duration-200 ease-in-out shadow-sm btn-primary hover:shadow-md focus:shadow-md active:shadow-sm"
          onClick={() => saveClient()}
        >
          הוספה
        </button>
      </form>
    </>
  );
}
export default NewClient;
