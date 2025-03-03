import { useState, useRef, useEffect } from "react";
import {
  Plus,
  GearSix,
  CheckCircle,
  Clock,
  PhoneCall,
  X,
  Calendar,
  TextAlignLeft,
} from "@phosphor-icons/react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useEisenhowerMatrix,
  Todo,
  QuadrantType,
} from "./hooks/useEisenhowerMatrix";
import { SortableTodoItem } from "./components/SortableTodoItem";
import { QuadrantDroppable } from "./components/QuadrantDroppable";
import { TodoItem } from "./components/TodoItem";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

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

function TodoList({
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

function App() {
  const { t } = useTranslation();
  const {
    getTodosByQuadrant,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    toggleExpanded,
    moveTodo,
    findTodoSource,
    clearAllData,
  } = useEisenhowerMatrix();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  // 설정 메뉴
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const quadrants = [
    {
      title: t("quadrants.urgent-important.title"),
      subtitle: t("quadrants.urgent-important.subtitle"),
      id: "urgent-important" as QuadrantType,
      icon: <CheckCircle size={24} weight="duotone" />,
      bgColor: "bg-red-50",
      accentColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      title: t("quadrants.not-urgent-important.title"),
      subtitle: t("quadrants.not-urgent-important.subtitle"),
      id: "not-urgent-important" as QuadrantType,
      icon: <Clock size={24} weight="duotone" />,
      bgColor: "bg-blue-50",
      accentColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: t("quadrants.urgent-not-important.title"),
      subtitle: t("quadrants.urgent-not-important.subtitle"),
      id: "urgent-not-important" as QuadrantType,
      icon: <PhoneCall size={24} weight="duotone" />,
      bgColor: "bg-amber-50",
      accentColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      title: t("quadrants.not-urgent-not-important.title"),
      subtitle: t("quadrants.not-urgent-not-important.subtitle"),
      id: "not-urgent-not-important" as QuadrantType,
      icon: <X size={24} weight="duotone" />,
      bgColor: "bg-green-50",
      accentColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  // Configure sensors for drag detection with modified settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Reduced distance to start dragging
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const id = active.id.toString();
    setActiveId(id);

    // Find the todo being dragged
    for (const quadrant of quadrants) {
      const todos = getTodosByQuadrant(quadrant.id);
      const todo = todos.find((t) => t.id.toString() === id);
      if (todo) {
        setActiveTodo(todo);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveTodo(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the source quadrant and index
    const sourceData = findTodoSource(activeId);
    if (!sourceData) return;

    const { quadrant: sourceQuadrant, index: sourceIndex } = sourceData;

    // Check if dropping onto a quadrant
    const isDroppedOnQuadrant = quadrants.some((q) => q.id === overId);

    if (isDroppedOnQuadrant) {
      const targetQuadrant = overId as QuadrantType;

      // If same quadrant, do nothing
      if (sourceQuadrant === targetQuadrant) return;

      // Move to the end of the target quadrant
      const destTodos = getTodosByQuadrant(targetQuadrant);
      moveTodo(sourceQuadrant, targetQuadrant, sourceIndex, destTodos.length);
    } else {
      // Find which todo we're dropping onto
      let targetQuadrant: QuadrantType | null = null;
      let targetIndex = -1;

      // Search all quadrants for the target todo
      for (const q of quadrants) {
        const todos = getTodosByQuadrant(q.id);
        const index = todos.findIndex((todo) => todo.id.toString() === overId);

        if (index !== -1) {
          targetQuadrant = q.id;
          targetIndex = index;
          break;
        }
      }

      if (!targetQuadrant) return;

      // If within same quadrant
      if (sourceQuadrant === targetQuadrant) {
        if (sourceIndex !== targetIndex) {
          moveTodo(sourceQuadrant, targetQuadrant, sourceIndex, targetIndex);
        }
      } else {
        // Moving between quadrants
        moveTodo(sourceQuadrant, targetQuadrant, sourceIndex, targetIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {t("app.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t("app.subtitle")}</p>
          </div>

          {/* Language switcher and settings */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <GearSix size={20} className="text-gray-500" />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      if (window.confirm(t("settings.clearConfirm"))) {
                        clearAllData();
                        setIsSettingsOpen(false);
                      }
                    }}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    {t("settings.clearAll")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quadrants.map((quadrant) => (
              <div key={quadrant.id} className="h-[450px]">
                <TodoList
                  title={quadrant.title}
                  subtitle={quadrant.subtitle}
                  icon={quadrant.icon}
                  quadrant={quadrant.id}
                  todos={getTodosByQuadrant(quadrant.id)}
                  accentColor={quadrant.accentColor}
                  onAddTodo={(text, description, dueDate) =>
                    addTodo(quadrant.id, text, description, dueDate)
                  }
                  onToggleTodo={(id) => toggleTodo(quadrant.id, id)}
                  onDeleteTodo={(id) => deleteTodo(quadrant.id, id)}
                  onEditTodo={(id, updates) =>
                    editTodo(quadrant.id, id, updates)
                  }
                  onToggleExpand={(id) => toggleExpanded(quadrant.id, id)}
                />
              </div>
            ))}
          </div>

          {/* Drag Overlay to show what's being dragged */}
          <DragOverlay>
            {activeId && activeTodo ? (
              <div className="w-full max-w-md shadow-lg">
                <TodoItem todo={activeTodo} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <footer className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
