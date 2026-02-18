"use client";

import { useState, useEffect } from "react";
import { Clock, Edit2, Check, X, FileText } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useNotes, useCreateNote, useUpdateNote } from "@/hooks";
import { usePlayerStore } from "@/stores/player-store";
import { formatTimestamp } from "@/lib/utils";

interface NoteSectionProps {
  lectureId: string;
}

export function NoteSection({ lectureId }: NoteSectionProps) {
  const { data: notes = [], isLoading } = useNotes(lectureId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { currentTime } = usePlayerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cue: "",
    content: "",
    summary: "",
  });

  // 이 강의에 대한 유저의 메모 (1개만 존재)
  const existingNote = notes.length > 0 ? notes[0] : null;

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
      // 수정
      await updateNote.mutateAsync({
        id: existingNote.id,
        cue: formData.cue || null,
        content: formData.content,
        summary: formData.summary || null,
        is_complete: isComplete,
      });
    } else {
      // 새로 생성
      await createNote.mutateAsync({
        video_id: lectureId,
        timestamp: Math.floor(currentTime),
        cue: formData.cue || null,
        content: formData.content,
        summary: formData.summary || null,
        is_complete: isComplete,
      });
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    if (existingNote) {
      setFormData({
        cue: existingNote.cue || "",
        content: existingNote.content,
        summary: existingNote.summary || "",
      });
    } else {
      setFormData({ cue: "", content: "", summary: "" });
    }
    setIsEditing(false);
  };

  const isPending = createNote.isPending || updateNote.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="h-5 w-5" />
            코넬노트 메모
          </h2>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              {existingNote ? "수정" : "작성"}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="rounded-lg border border-sequoia-200 bg-sequoia-50 p-4">
            {!existingNote && (
              <div className="mb-3 flex items-center gap-2 text-sm text-sequoia-600">
                <Clock className="h-4 w-4" />
                {formatTimestamp(currentTime)}
              </div>
            )}
            <NoteForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSave}
              onCancel={handleCancel}
              isLoading={isPending}
              isNew={!existingNote}
            />
          </div>
        ) : existingNote ? (
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                className="flex items-center gap-1 text-sm text-sequoia-600 hover:underline"
                onClick={() => {
                  // TODO: Seek to timestamp
                }}
              >
                <Clock className="h-3 w-3" />
                {formatTimestamp(existingNote.timestamp)}
              </button>
              {existingNote.is_complete && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  완료
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                  핵심 키워드 (Cue)
                </p>
                <p className="text-sm text-gray-700">
                  {existingNote.cue || <span className="text-gray-400">-</span>}
                </p>
              </div>
              <div className="md:col-span-2 rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                  노트 (Note)
                </p>
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {existingNote.content}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-yellow-50 p-3 border-t-2 border-yellow-200">
              <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                요약 (Summary)
              </p>
              <p className="text-sm text-gray-700">
                {existingNote.summary || (
                  <span className="text-gray-400">-</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">아직 메모가 없습니다.</p>
            <p className="text-sm text-gray-400">
              강의를 시청하며 코넬노트를 작성해보세요.
            </p>
            <Button
              className="mt-4"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              메모 작성하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NoteFormProps {
  formData: { cue: string; content: string; summary: string };
  setFormData: (data: {
    cue: string;
    content: string;
    summary: string;
  }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isNew: boolean;
}

function NoteForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
  isNew,
}: NoteFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            핵심 키워드 (Cue)
          </label>
          <textarea
            value={formData.cue}
            onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
            placeholder="주요 개념, 질문, 키워드"
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sequoia-500 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            노트 (Note) *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="강의 내용 상세 기록"
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sequoia-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          요약 (Summary)
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) =>
            setFormData({ ...formData, summary: e.target.value })
          }
          placeholder="핵심 내용 요약 (강의 후 작성)"
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sequoia-500 focus:outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="mr-1 h-4 w-4" />
          취소
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isLoading || !formData.content.trim()}
        >
          <Check className="mr-1 h-4 w-4" />
          {isNew ? "저장" : "수정"}
        </Button>
      </div>
    </div>
  );
}
