import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash, HandGrabbing } from "@phosphor-icons/react";
import { Todo, QuadrantType } from "../hooks/useEisenhowerMatrix";

interface SortableItemProps {
  id: string;
  todo: Todo;
  quadrantId: QuadrantType;
  onToggle: () => void;
  onDelete: () => void;
}

export function SortableItem({
  id,
  todo,
  onToggle,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "todo",
      todo,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center mb-2 border rounded p-2 
        ${isDragging ? "opacity-50 bg-gray-50" : "bg-white"}`}
    >
      <div
        className="cursor-grab mr-2 text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <HandGrabbing size={20} />
      </div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        className="mr-2"
        onClick={(e) => e.stopPropagation()}
      />
      <span className={todo.completed ? "line-through text-gray-500" : ""}>
        {todo.text}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-auto text-red-500"
        aria-label="Delete"
      >
        <Trash size={18} />
      </button>
    </li>
  );
}
