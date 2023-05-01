import prisma from ".";

// use prisma api to handle queries

export async function getUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    return error;
  }
}

export async function createUser(userData) {
  try {
    const newUser = await prisma.user.create({ data: userData });
    return { user: newUser };
  } catch (error) {
    return error;
  }
}

export async function getUserById(id) {
  try {
    const users = await prisma.user.findUniqe({ where: { id } });
    return users;
  } catch (error) {
    return error;
  }
}
