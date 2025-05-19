import { PrismaClient } from "../../prisma/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

/* OLD VERSION FOR REFERENCE
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};
const prisma =
  globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export default prisma;
*/

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
