import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import{ neonConfig } from '@neondatabase/serverless';


import ws from 'ws';
neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true

const connectionString ='${process.env.DATABASE_URL}';


const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = globalThis.prisma || new PrismaClient(process.env.NEXT_RUNTIME === "edge" ? { adapter } : {});

if (process.env.NEXT_RUNTIME !== "edge") globalThis.prisma = prisma;

export default prisma;