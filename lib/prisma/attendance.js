import prisma from ".";

export async function createAttendance(attendanceData) {
  try {
    const attendance = await prisma.attendance.create({ data: attendanceData });
    return { attendance };
  } catch (error) {
    return { error };
  }
}

export async function getAttendanceById(uid, pid, to, from) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: uid,
        projectId: pid,
      },
    });
    return attendances;
  } catch (error) {
    return error;
  }
}
