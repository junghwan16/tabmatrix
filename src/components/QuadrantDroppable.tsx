import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface QuadrantDroppableProps {
  id: string;
  children: React.ReactNode;
}

export function QuadrantDroppable({ id, children }: QuadrantDroppableProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-grow relative transition-colors
        ${isOver ? "bg-blue-50/40" : ""}`}
      style={{
        overflow: "hidden", // 중요: 고정 높이를 유지하고 자식 요소가 넘치지 않도록 함
      }}
    >
      {children}
    </div>
  );
}
