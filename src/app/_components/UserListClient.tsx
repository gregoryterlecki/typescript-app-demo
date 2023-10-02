'use client';
import { trpc } from '../_trpc/client';
import { serverClient } from '../_trpc/serverClient';

export default function UserListClient({
  initialUsers
}: {
  initialUsers: Awaited<ReturnType<(typeof serverClient)['user']['list']>>;
}) {
  const getUsers = trpc.user.list.useQuery(undefined, {
    initialData: initialUsers,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  return (
    <div>
      <div>{JSON.stringify(getUsers.data)}</div>
    </div>
  );
}
