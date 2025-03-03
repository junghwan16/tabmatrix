import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash,
  CheckCircle,
  X,
  Calendar,
  CaretDown,
  CaretUp,
  TextAlignLeft,
} from "@phosphor-icons/react";
import { Todo } from "../hooks/useEisenhowerMatrix";
import { useState, useRef, useEffect } from "react";

interface SortableTodoItemProps {
  id: string;
  todo: Todo;
  accentColor?: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (updates: {
    text?: string;
    description?: string;
    dueDate?: string;
    expanded?: boolean;
  }) => void;
  onToggleExpand: () => void;
}

export function SortableTodoItem({
  id,
  todo,
  accentColor = "border-gray-200",
  onToggle,
  onDelete,
  onEdit,
  onToggleExpand,
}: SortableTodoItemProps) {
  // 내부 편집 상태
  const [isEditing, setIsEditing] = useState(false);

  // 로컬 상태 대신 투두 항목의 expanded 속성을 사용
  const isExpanded = todo.expanded || false;

  const [editText, setEditText] = useState(todo.text);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");

  // 수정 폼 바깥쪽 클릭을 감지하기 위한 참조
  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { todo },
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  // 편집 모드 시 초기값 설정
  useEffect(() => {
    setEditText(todo.text);
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate || "");
  }, [todo, isEditing]);

  // 편집 모드가 활성화되면 자동으로 input에 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing]);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editDescription, isEditing]);

  // 외부 클릭 감지를 위한 이벤트 리스너
  useEffect(() => {
    // 외부 클릭을 감지하는 함수
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // 폼 외부를 클릭했을 때 변경 사항이 있으면 저장
        if (isEditing) {
          saveChanges();
        }
      }
    }

    // 편집 모드일 때만 문서에 클릭 이벤트 리스너 추가
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 클린업 함수
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, editText, editDescription, editDueDate]); // 의존성 배열에 편집 상태 변수 추가

  // 변경 사항을 저장하는 함수
  const saveChanges = () => {
    if (editText.trim()) {
      onEdit({
        text: editText.trim(),
        description: editDescription.trim() || undefined,
        dueDate: editDueDate || undefined,
        expanded: editDescription.trim() !== "" || editDueDate !== "", // 설명이나 마감일이 있으면 확장된 상태로 유지
      });
      setIsEditing(false);
    } else {
      // 텍스트가 비어있으면 원래 상태로 복원
      resetFormAndCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter 또는 Shift+Enter는 줄바꿈 허용
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault(); // 폼 제출 방지
      saveChanges();
    } else if (e.key === "Escape") {
      resetFormAndCancel();
    }
  };

  const resetFormAndCancel = () => {
    setEditText(todo.text);
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate || "");
    setIsEditing(false);
  };

  // 전체 아이템을 클릭하여 편집 모드로 전환하는 함수
  const activateEditMode = (e: React.MouseEvent) => {
    if (!isEditing) {
      e.stopPropagation(); // 이벤트 버블링 방지
      setIsEditing(true);
    }
  };

  // 확장 토글
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  // 마감일 포맷팅
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return null;

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, options);
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

  const hasDueDatePassed = (dateStr?: string) => {
    if (!dateStr) return false;

    const now = new Date();
    const dueDate = new Date(dateStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

    return dueDay < today;
  };

  const todoHasDetails = todo.description || todo.dueDate;

  return (
    <li
      ref={setNodeRef}
      style={style as React.CSSProperties}
      className={`group flex flex-col mb-3 rounded-md border ${accentColor} hover:bg-gray-50
        ${isEditing ? "shadow-md" : ""} 
        ${!isEditing && todo.completed ? "bg-gray-50 opacity-75" : "bg-white"}
        ${
          hasDueDatePassed(todo.dueDate) && !todo.completed
            ? "border-red-200"
            : ""
        }`}
      {...(!isEditing ? { ...attributes, ...listeners } : {})}
    >
      {/* 메인 콘텐츠 */}
      <div
        className={`flex items-center px-3 py-2.5 ${
          !isEditing ? "cursor-pointer" : ""
        }`}
        onClick={
          !isEditing
            ? todoHasDetails
              ? (e) => {
                  // Shift 키를 누른 상태로 클릭하면 확장/축소만 하고, 그 외에는 편집 모드로 전환
                  if (e.shiftKey) {
                    toggleExpanded(e);
                  } else {
                    activateEditMode(e);
                  }
                }
              : activateEditMode
            : undefined
        }
      >
        {/* 체크박스 */}
        <label
          className="flex items-center cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="sr-only"
          />
          <span
            className={`relative flex items-center justify-center w-5 h-5 border rounded mr-2
              ${
                todo.completed
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
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
        </label>

        {/* 텍스트 또는 편집 폼 */}
        {isEditing ? (
          <div ref={formRef} className="flex-1 flex flex-col">
            {/* 편집 입력 필드 영역 - 개선된 레이아웃 */}
            <div className="flex items-center bg-white">
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoFocus
                placeholder="할 일"
              />
            </div>

            {/* 설명 입력 필드 */}
            <div className="mt-3 flex items-start">
              <textarea
                ref={textareaRef}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[60px] resize-none overflow-hidden"
                placeholder="설명 (선택사항)"
                rows={1}
              />
            </div>

            {/* 마감일 입력 필드 */}
            <div className="mt-3 flex items-center">
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* 안내 메시지 - 개선된 스타일 */}
            <div className="mt-3 text-xs text-gray-400 text-right">
              <span className="bg-gray-50 px-2 py-1 rounded-md inline-block">
                편집을 완료하려면 외부를 클릭하거나 Enter를 누르세요
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex items-center">
            <span
              className={`text-sm truncate ${
                todo.completed ? "line-through text-gray-400" : "text-gray-700"
              }`}
            >
              {todo.text}
            </span>

            {/* 마감일 표시 (접힌 상태에서도 보임) */}
            {todo.dueDate && (
              <div
                className={`ml-2 flex items-center text-xs px-2 py-0.5 rounded-full 
                  ${getDueDateColor(todo.dueDate)} border border-current`}
              >
                <Calendar size={12} className="mr-1" />
                {formatDueDate(todo.dueDate)}
              </div>
            )}

            {/* 확장/삭제 버튼 */}
            <div className="ml-auto flex items-center">
              {todoHasDetails && (
                <button
                  onClick={toggleExpanded}
                  className="ml-1 text-gray-400 group-hover:opacity-100 hover:text-gray-600"
                >
                  {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="ml-1 text-gray-400 group-hover:opacity-100 hover:text-red-500"
                aria-label="Delete"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 확장된 설명 영역 */}
      {isExpanded && !isEditing && todo.description && (
        <div
          className="px-10 py-2 border-t border-gray-100 text-sm cursor-pointer"
          onClick={activateEditMode}
        >
          <p className="text-gray-600 whitespace-pre-wrap mb-2">
            {todo.description}
          </p>
        </div>
      )}
    </li>
  );
}
