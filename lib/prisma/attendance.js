import prisma from ".";

export async function createAttendance(attendanceData) {
  try {
    const attendance = await prisma.attendance.create({
      data: { ...attendanceData, date: new Date(attendanceData.date) },
    });
    return { attendance };
  } catch (error) {
    return { error };
  }
}

export async function searchAttendace(uid, pid, startDate, endDate) {
  const whereClause = {};
  if (uid) whereClause.employeeId = uid;
  if (pid) whereClause.projectId = pid;

  if (startDate) {
    whereClause.date = {};
    whereClause.date.gte = startDate;
  }
  if (endDate) whereClause.date.lte = endDate;
  // console.log(whereClause);
  try {
    const attendances = await prisma.attendance.findMany({
      where: whereClause,
    });

    return attendances;
  } catch (error) {
    console.log(error);
    return error;
  }
}
