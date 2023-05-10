import { getClients } from "@/lib/prisma/clients";

async function newProject() {
  const clients = await getClients();

  return (
    <form>
      <div>
        {clients && console.log(clients)}
        <label>name</label>
        <input />
      </div>
      <div>
        <label>adress</label>
        <input />
      </div>
      <div>
        <label>לקוח</label>
        <select>
          <option value={"בחר לקוח"}>בחר לקוח</option>
          {clients.map((c) => (
            <option value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>נפתח בתאריך</label>
        <input />
      </div>
    </form>
  );
}

export default newProject;
