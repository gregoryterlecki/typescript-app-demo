import { publicProcedure, router } from '../trpc';
import db from '@/db';

export const userRouter = router({
  list: publicProcedure.query(async () => {
    const users = await db.User.list();
    return users;
  })
});
