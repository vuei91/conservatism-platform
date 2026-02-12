"use client";

import { useState } from "react";
import { FileText, PenLine } from "lucide-react";
import { useNotes } from "@/hooks";
import { NotePanel } from "./note-modal";

interface NoteFloatingButtonProps {
  lectureId: string;
}

export function NoteFloatingButton({ lectureId }: NoteFloatingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: notes = [] } = useNotes(lectureId);

  const hasNote = notes.length > 0;
  const isComplete = hasNote && notes[0].is_complete;

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          flex items-center gap-2 px-5 py-3
          rounded-full shadow-lg
          transition-all duration-200
          hover:scale-105 hover:shadow-xl
          ${
            isComplete
              ? "bg-green-500 text-white hover:bg-green-600"
              : hasNote
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-900 text-white hover:bg-gray-800"
          }
        `}
        aria-label="메모 열기"
      >
        {hasNote ? (
          <PenLine className="h-5 w-5" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
        <span className="font-medium">
          {isComplete ? "메모 완료" : hasNote ? "메모 수정" : "메모 작성"}
        </span>

        {/* 알림 뱃지 */}
        {hasNote && !isComplete && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* 사이드 패널 */}
      <NotePanel
        lectureId={lectureId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
