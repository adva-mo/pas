function newAttendance() {
  return (
    <form>
      <div>
        <label>עובד</label>
        <select>בחר עובד</select>
      </div>
      <div>
        <label>פרוייקט</label>
        <select>בחר פרוייקט</select>
      </div>
      <div>
        <label>תאריך</label>
        <input />
      </div>
      <div>
        <label>הספק</label>
        <input />
      </div>
      <div>
        <label>תשלום יומי</label>
        <input typeof="number" />
      </div>
      <div>
        <label>הערות</label>
        <input />
      </div>
      <button>הוספה</button>
    </form>
  );
}

export default newAttendance;

//fetch open projects and users
