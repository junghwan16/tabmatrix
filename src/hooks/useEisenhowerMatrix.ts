import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  description?: string;  // 할 일에 대한 추가 설명
  dueDate?: string;      // 마감일
  expanded?: boolean;    // 세부 정보 표시 여부
}

export type QuadrantType =
  | 'urgent-important'
  | 'not-urgent-important'
  | 'urgent-not-important'
  | 'not-urgent-not-important';

// 로컬스토리지 키
const STORAGE_KEY = 'eisenhower-matrix-todos';

// 로컬스토리지에서 데이터 로드
const loadFromLocalStorage = (): Record<QuadrantType, Todo[]> => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }

  return {
    'urgent-important': [],
    'not-urgent-important': [],
    'urgent-not-important': [],
    'not-urgent-not-important': []
  };
};

export const useEisenhowerMatrix = () => {
  // 로컬스토리지에서 초기 데이터 로드
  const initialData = loadFromLocalStorage();

  const [urgentImportant, setUrgentImportant] = useState<Todo[]>(initialData['urgent-important']);
  const [notUrgentImportant, setNotUrgentImportant] = useState<Todo[]>(initialData['not-urgent-important']);
  const [urgentNotImportant, setUrgentNotImportant] = useState<Todo[]>(initialData['urgent-not-important']);
  const [notUrgentNotImportant, setNotUrgentNotImportant] = useState<Todo[]>(initialData['not-urgent-not-important']);

  // 데이터가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    const allData = {
      'urgent-important': urgentImportant,
      'not-urgent-important': notUrgentImportant,
      'urgent-not-important': urgentNotImportant,
      'not-urgent-not-important': notUrgentNotImportant
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [urgentImportant, notUrgentImportant, urgentNotImportant, notUrgentNotImportant]);

  const getQuadrantSetter = (quadrant: QuadrantType) => {
    switch (quadrant) {
      case "urgent-important": return setUrgentImportant;
      case "not-urgent-important": return setNotUrgentImportant;
      case "urgent-not-important": return setUrgentNotImportant;
      case "not-urgent-not-important": return setNotUrgentNotImportant;
    }
  };

  const getTodosByQuadrant = (quadrant: QuadrantType): Todo[] => {
    switch (quadrant) {
      case "urgent-important":
        return urgentImportant;
      case "not-urgent-important":
        return notUrgentImportant;
      case "urgent-not-important":
        return urgentNotImportant;
      case "not-urgent-not-important":
        return notUrgentNotImportant;
    }
  };

  const findTodoSource = (todoId: string): { quadrant: QuadrantType, index: number } | null => {
    // Search in all quadrants
    for (const quadrant of ['urgent-important', 'not-urgent-important',
      'urgent-not-important', 'not-urgent-not-important'] as QuadrantType[]) {
      const todos = getTodosByQuadrant(quadrant);
      const index = todos.findIndex(todo => todo.id.toString() === todoId);

      if (index !== -1) {
        return { quadrant, index };
      }
    }
    return null;
  };

  const addTodo = (quadrant: QuadrantType, text: string, description?: string, dueDate?: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      description,
      dueDate,
      expanded: false
    };

    const setter = getQuadrantSetter(quadrant);
    setter(current => [...current, newTodo]);
  };

  // 확장 상태 토글
  const toggleExpanded = (quadrant: QuadrantType, id: number) => {
    const setter = getQuadrantSetter(quadrant);
    setter(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, expanded: !todo.expanded } : todo
      )
    );
  };

  const toggleTodo = (quadrant: QuadrantType, id: number) => {
    const setter = getQuadrantSetter(quadrant);
    setter(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (quadrant: QuadrantType, id: number) => {
    const setter = getQuadrantSetter(quadrant);
    setter(todos => todos.filter(todo => todo.id !== id));
  };

  const editTodo = (
    quadrant: QuadrantType,
    id: number,
    updates: { text?: string; description?: string; dueDate?: string; expanded?: boolean }
  ) => {
    const setter = getQuadrantSetter(quadrant);
    setter(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  };

  const reorderTodo = (
    sourceQuadrant: QuadrantType,
    destinationQuadrant: QuadrantType,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    // If reordering in the same quadrant
    if (sourceQuadrant === destinationQuadrant) {
      const setter = getQuadrantSetter(sourceQuadrant);
      setter(todos => arrayMove(todos, sourceIndex, destinationIndex));
      return;
    }

    // Moving between different quadrants
    const sourceTodos = [...getTodosByQuadrant(sourceQuadrant)];
    const destTodos = [...getTodosByQuadrant(destinationQuadrant)];

    // Get the todo to move
    const [todoToMove] = sourceTodos.splice(sourceIndex, 1);

    // Add to destination
    destTodos.splice(destinationIndex, 0, todoToMove);

    // Update both lists
    const sourceSetter = getQuadrantSetter(sourceQuadrant);
    const destSetter = getQuadrantSetter(destinationQuadrant);

    sourceSetter(sourceTodos);
    destSetter(destTodos);
  };

  const moveTodo = (
    sourceQuadrant: QuadrantType,
    destinationQuadrant: QuadrantType,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    // If moving within the same quadrant
    if (sourceQuadrant === destinationQuadrant) {
      const setter = getQuadrantSetter(sourceQuadrant);
      setter(todos => arrayMove(todos, sourceIndex, destinationIndex));
      return;
    }

    // Moving between different quadrants
    const sourceTodos = [...getTodosByQuadrant(sourceQuadrant)];
    const destTodos = [...getTodosByQuadrant(destinationQuadrant)];

    // Get the todo to move
    const [todoToMove] = sourceTodos.splice(sourceIndex, 1);

    // Add to destination
    destTodos.splice(destinationIndex, 0, todoToMove);

    // Update both lists
    const sourceSetter = getQuadrantSetter(sourceQuadrant);
    const destSetter = getQuadrantSetter(destinationQuadrant);

    sourceSetter(sourceTodos);
    destSetter(destTodos);
  };

  // 모든 데이터 초기화
  const clearAllData = () => {
    setUrgentImportant([]);
    setNotUrgentImportant([]);
    setUrgentNotImportant([]);
    setNotUrgentNotImportant([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    getTodosByQuadrant,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    toggleExpanded,
    reorderTodo,
    moveTodo,
    findTodoSource,
    clearAllData
  };
};
