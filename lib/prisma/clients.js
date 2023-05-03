import prisma from ".";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany();
    return { clients };
  } catch (error) {
    return { error };
  }
}

export async function createClient(clientData) {
  //todo send feedback of missing fields
  try {
    const client = await prisma.client.create({ data: clientData });
    return { client };
  } catch (error) {
    return { error };
  }
}
