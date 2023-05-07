import prisma from ".";

export async function createAttendance(attendanceData) {
  try {
    const attendance = await prisma.attendance.create({ data: attendanceData });
    return { attendance };
  } catch (error) {
    return { error };
  }
}

export async function getAttendanceById(id) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { employeeId: id },
    });
    return { attendances };
  } catch (error) {
    return { error };
  }
}
