import prisma from ".";

export async function createAttendance(attendanceData) {
  try {
    const attendance = await prisma.attendance.create({ data: attendanceData });
    return { attendance };
  } catch (error) {
    return { error };
  }
}
