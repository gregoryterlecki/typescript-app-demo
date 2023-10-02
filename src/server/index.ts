import { router } from './trpc';
import { userRouter } from './user';
import { todoRouter } from './todo';

export const appRouter = router({
  user: userRouter,
  todo: todoRouter
});

export type AppRouter = typeof appRouter;
