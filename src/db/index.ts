// import { PrismaClient } from "../../generated/prisma";

// const prisma = new PrismaClient();

// async function main() {
//   // const user = await prisma.user.create({
//   //   data: {
//   //     name: "Alice",
//   //     email: "alice@prisma.io",
//   //   },
//   // });
//   // console.log(user);
//   const users = await prisma.user.findMany();
//   console.log(users);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export default prisma;
