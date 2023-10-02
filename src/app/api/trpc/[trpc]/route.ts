// compare adapters/fetch to adapters/next. For more info: https://youtu.be/XY8zyvxFvqM?si=8sqr8rqgsRLN7E1D&t=249
// import * as trpcNext from '@trpc/server/adapters/next';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server';

// This is what we need to be able to route calls to our tRPC instance.
// The [trpc] in the route name will capture the 'verb' (i.e. listUsers)

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({})
  });

export { handler as GET, handler as POST };

// export default trpcNext.createNextApiHandler({
//   router: appRouter,
//   createContext: () => ({})
// });
