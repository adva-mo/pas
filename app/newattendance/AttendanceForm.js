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
      className="text-right"
      ref={formRef}
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <select name="employeeId">
          <option>בחר עובד</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}{" "}
            </option>
          ))}
        </select>
        <label htmlFor="employeeId">עובד</label>
      </div>
      <div>
        <select name="projectId">
          <option>בחר פרוייקט</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <label htmlFor="projectId">פרוייקט</label>
      </div>
      <div>
        <input name="date" />
        <label htmlFor="date">תאריך</label>
      </div>
      <div>
        <input name="production" />
        <label htmlFor="production">הספק</label>
      </div>
      <div>
        <input typeof="int" name="payment" />
        <label htmlFor="payment">תשלום יומי</label>
      </div>
      <div>
        <input name="notes" />
        <label htmlFor="notes">הערות</label>
      </div>
      <button onClick={() => saveAttendance()}>שמירה</button>
    </form>
  );
}

export default AttendanceForm;
