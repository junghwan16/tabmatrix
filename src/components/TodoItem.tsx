import { Calendar } from "@phosphor-icons/react";
import { Todo } from "../hooks/useEisenhowerMatrix";
import { useTranslation } from "react-i18next";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { t, i18n } = useTranslation();

  // 마감일 포맷팅
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(i18n.language, options);
    } catch (e) {
      return dateStr;
    }
  };

  // 마감일까지 남은 시간 계산
  const getDueDateColor = (dateStr?: string) => {
    if (!dateStr) return "text-gray-400";

    const now = new Date();
    const dueDate = new Date(dateStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

    // 이미 지난 마감일
    if (dueDay < today) return "text-red-500";

    // 오늘이 마감일
    if (dueDay.getTime() === today.getTime()) return "text-amber-500";

    // 마감일이 3일 이내라면
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    if (dueDay <= threeDaysFromNow) return "text-amber-400";

    return "text-green-500";
  };

  return (
    <div className="flex flex-col rounded-md shadow-md border bg-white cursor-grab">
      <div className="px-3 py-2.5 flex items-center">
        <div className="flex items-center flex-1">
          <span
            className={`relative flex items-center justify-center w-5 h-5 border rounded mr-2 
            ${
              todo.completed ? "bg-blue-500 border-blue-500" : "border-gray-300"
            }`}
          >
            {todo.completed && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>

          <span
            className={`text-sm ${
              todo.completed ? "line-through text-gray-400" : "text-gray-700"
            }`}
          >
            {todo.text}
          </span>

          {/* 마감일 표시 */}
          {todo.dueDate && (
            <div
              className={`ml-2 flex items-center text-xs px-2 py-0.5 rounded-full ${getDueDateColor(
                todo.dueDate
              )} border border-current`}
            >
              <Calendar size={12} className="mr-1" />
              {formatDueDate(todo.dueDate)}
            </div>
          )}
        </div>
      </div>

      {/* 설명이 있으면 표시 - 여러 줄 지원 */}
      {todo.description && (
        <div className="px-10 py-2 border-t border-gray-100 text-sm">
          <p className="text-gray-600 whitespace-pre-wrap">
            {todo.description}
          </p>
        </div>
      )}
    </div>
  );
}
