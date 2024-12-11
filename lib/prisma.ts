import { PrismaClient } from "@prisma/client";


const prismaSingleConn =()=>{
    return new PrismaClient()
}

type prismaSingleConn = ReturnType< typeof prismaSingleConn>
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? prismaSingleConn()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma



