import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();

setInterval(async () => {
  const date = new Date();
  if (date.getDate() === 1) {
    await prismaClient.categorias.updateMany({
      data: {
        valor_atual: 0,
      },
    });
  }
}, 30 * 60 * 1000);
