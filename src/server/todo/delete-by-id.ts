import { z } from 'zod';
import { publicProcedure } from '../trpc';
import db from '@/db';

const deleteById = publicProcedure
  .input(
    z.object({
      id: z.string()
    })
  )
  .mutation(async ({ input }) => {
    const { id } = input;
    return await db.Todo.deleteById(id);
  });

export default deleteById;
