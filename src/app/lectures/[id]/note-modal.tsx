"use client";

import { useState, useEffect } from "react";
import { Check, X, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks";
import { usePlayerStore } from "@/stores/player-store";

interface NotePanelProps {
  lectureId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotePanel({ lectureId, isOpen, onClose }: NotePanelProps) {
  const { data: notes = [], isLoading } = useNotes(lectureId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { currentTime } = usePlayerStore();
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    cue: "",
    content: "",
    summary: "",
  });

  const existingNote = notes.length > 0 ? notes[0] : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (existingNote) {
      setFormData({
        cue: existingNote.cue || "",
        content: existingNote.content,
        summary: existingNote.summary || "",
      });
    }
  }, [existingNote]);

  const handleSave = async () => {
    if (!formData.content.trim()) return;

    const isComplete = !!(formData.cue && formData.content && formData.summary);

    if (existingNote) {
      await updateNote.mutateAsync({
        id: existingNote.id,
        cue: formData.cue || null,
        content: formData.content,
        summary: formData.summary || null,
        is_complete: isComplete,
      });
    } else {
      await createNote.mutateAsync({
        video_id: lectureId,
        timestamp: Math.floor(currentTime),
        cue: formData.cue || null,
        content: formData.content,
        summary: formData.summary || null,
        is_complete: isComplete,
      });
    }

    onClose();
  };

  const handleReset = async () => {
    if (!existingNote) return;
    if (!confirm("메모를 초기화하시겠습니까?")) return;

    await deleteNote.mutateAsync({
      id: existingNote.id,
      videoId: lectureId,
    });
    setFormData({ cue: "", content: "", summary: "" });
  };

  const isPending =
    createNote.isPending || updateNote.isPending || deleteNote.isPending;

  // 모바일: 아래에서 올라오는 패널 (영상 영역 제외)
  // 데스크탑: 오른쪽에서 나오는 사이드 패널
  const panelClasses = isMobile
    ? `fixed bottom-0 left-0 right-0 h-[60vh] bg-white shadow-2xl z-50 rounded-t-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`
    : `fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`;

  return (
    <div className={panelClasses}>
      {/* 모바일 드래그 핸들 */}
      {isMobile && (
        <div className="flex justify-center py-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="h-5 w-5" />
          코넬노트 메모
        </h2>
        <div className="flex items-center gap-2">
          {existingNote && (
            <button
              onClick={handleReset}
              disabled={isPending}
              className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="초기화"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div
        className={`overflow-y-auto p-6 pb-24 ${
          isMobile ? "h-[calc(60vh-80px)]" : "h-[calc(100%-80px)]"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cue 영역 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                핵심 키워드 (Cue)
              </label>
              <p className="text-xs text-gray-500">주요 개념, 질문, 키워드</p>
              <textarea
                value={formData.cue}
                onChange={(e) =>
                  setFormData({ ...formData, cue: e.target.value })
                }
                placeholder="예: React Hooks, 상태관리..."
                rows={isMobile ? 2 : 4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
              />
            </div>

            {/* Note 영역 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                노트 (Note) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">강의 내용 상세 기록</p>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="강의에서 배운 내용을 정리해보세요..."
                rows={isMobile ? 4 : 8}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
              />
            </div>

            {/* Summary 영역 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                요약 (Summary)
              </label>
              <p className="text-xs text-gray-500">핵심 내용 한 줄 요약</p>
              <textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="이 강의의 핵심은..."
                rows={isMobile ? 2 : 3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
              />
            </div>

            {/* 완료 상태 */}
            {existingNote?.is_complete && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <Check className="h-4 w-4" />
                <span className="text-sm">모든 항목 작성 완료</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t bg-white px-6 py-4">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={onClose}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={isPending || !formData.content.trim()}
        >
          {existingNote ? "수정하기" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}
