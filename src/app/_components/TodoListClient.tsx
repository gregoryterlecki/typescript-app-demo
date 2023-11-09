'use client';
import { useCallback } from 'react';
import { trpc } from '../_trpc/client';
import { serverClient } from '../_trpc/serverClient';

import Todo from './Todo';

export default function TodoListClient({
  initialTodos
}: {
  initialTodos: Awaited<ReturnType<(typeof serverClient)['todo']['list']>>;
}) {
  const getTodos = trpc.todo.list.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const deleteTodo = trpc.todo.deleteById.useMutation({
    onSettled: () => {
      getTodos.refetch();
    }
  });

  const handleDelete = useCallback(
    (id: string) => () => {
      // should you be using 'useCallback'?
      deleteTodo.mutate({ id });
    },
    [deleteTodo]
  );

  return (
    <div>
      <div>
        {getTodos.data.map((todoData) => (
          <Todo
            key={todoData.id}
            todoData={todoData}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
