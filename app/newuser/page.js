"use client";
import axios from "axios";
import { useRef } from "react";

export default function newUser() {
  const oidRef = useRef();
  const nameRef = useRef();

  const saveUser = async () => {
    const newUser = {
      oid: Number(oidRef.current.value),
      name: nameRef.current.value,
      password: oidRef.current.value,
    };
    const { data } = await axios.post(
      "http://localhost:3000/api/users",
      newUser
    );
    console.log(data);
  };

  return (
    <form className="text-right" onSubmit={(e) => e.preventDefault()}>
      <div>
        <input ref={nameRef} />
        <label>שם</label>
      </div>
      <div>
        <input ref={oidRef} />
        <label>ת.ז.</label>
      </div>
      <button onClick={() => saveUser()}>שמירה</button>
    </form>
  );
}
