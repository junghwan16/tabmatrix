import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { QuadrantType } from "../hooks/useEisenhowerMatrix";

interface QuadrantProps {
  id: QuadrantType;
  children: React.ReactNode;
}

export function Quadrant({ id, children }: QuadrantProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      data-quadrant={id}
      className={`overflow-auto flex-grow rounded p-2 transition-colors 
        ${isOver && active ? "bg-gray-100 ring-2 ring-blue-400" : ""}`}
      style={{
        minHeight: "100px",
      }}
    >
      {children}
    </div>
  );
}
