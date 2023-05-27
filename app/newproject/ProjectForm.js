"use client";
import { useRef } from "react";
import axios from "axios";

function ProjectForm({ clients }) {
  const formRef = useRef();

  const saveProject = async () => {
    try {
      const newProject = Object.fromEntries(new FormData(formRef.current));
      formRef.current.reset();
      const { data } = await axios.post(
        "http://localhost:3000/api/projects",
        newProject
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} ref={formRef}>
      <div>
        {clients && console.log(clients)}
        <label htmlFor="name">name</label>
        <input name="name" />
      </div>
      <div>
        <label htmlFor="adress">adress</label>
        <input name="adress" />
      </div>
      <div>
        <label htmlFor="clientId">לקוח</label>
        <select name="clientId">
          <option value={"בחר לקוח"}>בחר לקוח</option>
          {clients?.map((c) => (
            <option value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="startedAt">נפתח בתאריך</label>
        <input name="startedAt" />
      </div>
      <button className="btn-primary" onClick={() => saveProject()}>
        שמירה
      </button>
    </form>
  );
}
export default ProjectForm;
