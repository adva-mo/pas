"use client";
import axios from "axios";
import { useRef } from "react";
import PageHeader from "../UI/pageHeader/PageHeader.js";

function newClient() {
  const formRef = useRef();

  const saveClient = async () => {
    try {
      const newClient = Object.fromEntries(new FormData(formRef.current));
      formRef.current.reset();
      const { data } = await axios.post("http://localhost:3000/api/clients", {
        ...newClient,
        oid: Number(newClient.oid),
      });
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <PageHeader title="הוסף לקוח"></PageHeader>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div>
          <input name="oid"></input>
          <label htmlFor="oid">ח.פ.</label>
        </div>
        <div>
          <input name="name"></input>
          <label htmlFor="name">שם</label>
        </div>
        <button className="btn-primary" onClick={() => saveClient()}>
          הוספה
        </button>
      </form>
    </>
  );
}
export default newClient;
