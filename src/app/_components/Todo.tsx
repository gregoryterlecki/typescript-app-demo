type TodoDataProp = {
  id: string;
  text: string | null;
  createdAt: string;
  updatedAt: string;
};

type TodoProps = {
  key: string;
  handleDelete: (id: string) => () => void;
  todoData: TodoDataProp;
};

const Todo = ({ todoData, handleDelete }: TodoProps) => {
  const { id, text } = todoData;
  return (
    <div>
      <div>{text}</div>
      <button onClick={handleDelete(id)}>Delete</button>
    </div>
  );
};

export default Todo;
