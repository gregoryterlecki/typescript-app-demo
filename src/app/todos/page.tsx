import { serverClient } from '../_trpc/serverClient';

import TodoListClient from '../_components/TodoListClient';

const Todos = async () => {
  const initialTodos = await serverClient.todo.list();

  return <TodoListClient initialTodos={initialTodos} />;
};

export default Todos;
