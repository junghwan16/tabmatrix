import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableContainer({ id, children }: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`overflow-auto flex-grow ${isOver ? "bg-gray-100" : ""}`}
    >
      {children}
    </div>
  );
}
