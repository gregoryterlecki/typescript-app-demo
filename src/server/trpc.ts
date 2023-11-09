// this file is used to help bring in some of the important tools from @trpc, used to create routers,
// whereas index.ts is where we actually use these things to assemble the main router itself
// (assemble routers representing different namespaces of concepts within the app, for example)

import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
