import { router } from '../trpc';

import list from './list';
import deleteById from './delete-by-id';

export const todoRouter = router({
  list,
  deleteById
});
