import prisma from ".";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    return error;
  }
}

export async function createUser(userData) {
  //todo send feedback of missing fields
  try {
    const user = await prisma.user.create({ data: userData });
    return { user };
  } catch (error) {
    return { error };
  }
}

export async function getUserById(id) {
  try {
    const users = await prisma.user.findUnique({ where: { id } });
    return users;
  } catch (error) {
    return error;
  }
}
