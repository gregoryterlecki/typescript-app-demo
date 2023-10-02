import { serverClient } from '../_trpc/serverClient';

import UserListClient from '../_components/UserListClient';

export default async function Home() {
  const initialUsers = await serverClient.user.list();

  return (
    <div>
      <UserListClient initialUsers={initialUsers} />
    </div>
  );
}
