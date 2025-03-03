import { useState, useRef, useEffect } from "react";
import { Todo, QuadrantType } from "../hooks/useEisenhowerMatrix";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTodoItem } from "./SortableTodoItem";
import { QuadrantDroppable } from "./QuadrantDroppable";
import { useTranslation } from "react-i18next";
import { Plus, X, Calendar, TextAlignLeft } from "@phosphor-icons/react";

interface TodoListProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  quadrant: QuadrantType;
  todos: Todo[];
  accentColor: string;
  onAddTodo: (text: string, description?: string, dueDate?: string) => void;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  onEditTodo: (
    id: number,
    updates: {
      text?: string;
      description?: string;
      dueDate?: string;
      expanded?: boolean;
    }
  ) => void;
  onToggleExpand: (id: number) => void;
}

export function TodoList({
  title,
  subtitle,
  icon,
  quadrant,
  todos,
  accentColor,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onToggleExpand,
}: TodoListProps) {
  const { t } = useTranslation();
  const [newTodo, setNewTodo] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingDetailed, setIsAddingDetailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo, newDescription, newDueDate || undefined);
      setNewTodo("");
      setNewDescription("");
      setNewDueDate("");
      setIsAdding(false);
      setIsAddingDetailed(false);
    }
  };

  const handleCancel = () => {
    setNewTodo("");
    setNewDescription("");
    setNewDueDate("");
    setIsAdding(false);
    setIsAddingDetailed(false);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't cancel if clicking on related elements
    if (
      e.relatedTarget &&
      (e.relatedTarget === document.querySelector(".details-btn") ||
        e.relatedTarget === document.querySelector(".cancel-btn") ||
        e.currentTarget.contains(e.relatedTarget as Node))
    ) {
      return;
    }

    if (!newTodo.trim()) {
      handleCancel();
    } else {
      handleAddTodo();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isAddingDetailed || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleAddTodo();
      }
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Focus the input when isAdding changes to true
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const todoIds = todos.map((todo) => todo.id.toString());

  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col border border-gray-100 overflow-hidden">
      <div
        className={`px-4 py-3 flex items-center border-b ${accentColor} rounded-t-lg flex-shrink-0`}
      >
        <div className="mr-3 text-gray-700">{icon}</div>
        <div>
          <h2 className="font-medium text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* 새 항목 추가 UI를 항상 상단에 고정 */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        {isAdding ? (
          <div className="flex flex-col" onBlur={handleInputBlur} tabIndex={-1}>
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="border border-gray-200 p-2 flex-grow rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder={t("todo.editing.title")}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <button
                className="ml-1 p-2 text-gray-400 hover:text-gray-600 transition details-btn"
                onClick={() => setIsAddingDetailed(!isAddingDetailed)}
                title={
                  isAddingDetailed ? t("todo.hideDetails") : t("todo.details")
                }
              >
                <TextAlignLeft size={18} />
              </button>
              <button
                className="ml-1 p-2 text-gray-400 hover:text-gray-600 transition cancel-btn"
                onClick={handleCancel}
              >
                <X size={18} />
              </button>
            </div>

            {isAddingDetailed && (
              <div className="mt-2 space-y-2">
                <div className="flex items-start">
                  <TextAlignLeft
                    size={16}
                    className="text-gray-400 mr-2 mt-2"
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="border border-gray-200 p-2 w-full rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[60px]"
                    placeholder={t("todo.description")}
                    rows={2}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        handleAddTodo();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="border border-gray-200 p-2 w-full rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition py-2 px-3 rounded-md w-full border border-dashed border-gray-200 hover:border-gray-300"
          >
            <Plus size={18} className="mr-1" />
            {t("todo.add")}
          </button>
        )}
      </div>

      <QuadrantDroppable id={quadrant}>
        <div className="flex-grow h-full overflow-auto px-3 py-2">
          <SortableContext
            items={todoIds}
            strategy={verticalListSortingStrategy}
          >
            <ul className="w-full">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  id={todo.id.toString()}
                  todo={todo}
                  accentColor={accentColor.replace("bg-", "border-")}
                  onToggle={() => onToggleTodo(todo.id)}
                  onDelete={() => onDeleteTodo(todo.id)}
                  onEdit={(updates) => onEditTodo(todo.id, updates)}
                  onToggleExpand={() => onToggleExpand(todo.id)}
                />
              ))}
            </ul>
          </SortableContext>

          {todos.length === 0 && (
            <div className="mt-6 text-center py-8 text-gray-400 text-sm">
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-50">
                <Plus size={24} weight="light" />
              </div>
              {t("todo.emptyState")}
            </div>
          )}
        </div>
      </QuadrantDroppable>
    </div>
  );
}
