import { useState } from "react";
import {
  GearSix,
  CheckCircle,
  Clock,
  PhoneCall,
  X,
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useEisenhowerMatrix,
  Todo,
  QuadrantType,
} from "./hooks/useEisenhowerMatrix";
import { TodoItem } from "./components/TodoItem";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { TodoList } from "./components/TodoList";

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
