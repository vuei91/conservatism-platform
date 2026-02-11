"use client";

import { useState } from "react";
import { Plus, Clock, Trash2, Edit2, Check, X } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks";
import { usePlayerStore } from "@/stores/player-store";
import { formatTimestamp } from "@/lib/utils";
import type { Note } from "@/types/database";

interface NoteSectionProps {
  lectureId: string;
}

export function NoteSection({ lectureId }: NoteSectionProps) {
  const { data: notes = [], isLoading } = useNotes(lectureId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { currentTime } = usePlayerStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cue: "",
    content: "",
    summary: "",
  });

  const handleCreate = async () => {
    if (!formData.content.trim()) return;

    const isComplete = !!(formData.cue && formData.content && formData.summary);

    await createNote.mutateAsync({
      lecture_id: lectureId,
      timestamp: Math.floor(currentTime),
      cue: formData.cue || null,
      content: formData.content,
      summary: formData.summary || null,
      is_complete: isComplete,
    });

    setFormData({ cue: "", content: "", summary: "" });
    setIsCreating(false);
  };

  const handleUpdate = async (note: Note) => {
    const isComplete = !!(formData.cue && formData.content && formData.summary);

    await updateNote.mutateAsync({
      id: note.id,
      cue: formData.cue || null,
      content: formData.content,
      summary: formData.summary || null,
      is_complete: isComplete,
    });

    setEditingId(null);
    setFormData({ cue: "", content: "", summary: "" });
  };

  const handleDelete = async (note: Note) => {
    if (confirm("메모를 삭제하시겠습니까?")) {
      await deleteNote.mutateAsync({ id: note.id, lectureId });
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({
      cue: note.cue || "",
      content: note.content,
      summary: note.summary || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ cue: "", content: "", summary: "" });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">코넬노트 메모</h2>
          {!isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="mr-1 h-4 w-4" />
              메모 추가
            </Button>
          )}
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              {formatTimestamp(currentTime)}
            </div>
            <NoteForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreating(false);
                setFormData({ cue: "", content: "", summary: "" });
              }}
              isLoading={createNote.isPending}
            />
          </div>
        )}

        {/* Notes List */}
        {isLoading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-gray-500">
            아직 메모가 없습니다. 강의를 시청하며 메모를 작성해보세요.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                {editingId === note.id ? (
                  <NoteForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={() => handleUpdate(note)}
                    onCancel={cancelEdit}
                    isLoading={updateNote.isPending}
                  />
                ) : (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <button
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        onClick={() => {
                          // TODO: Seek to timestamp
                        }}
                      >
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(note.timestamp)}
                      </button>
                      <div className="flex items-center gap-2">
                        {note.is_complete && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            완료
                          </span>
                        )}
                        <button
                          onClick={() => startEdit(note)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          핵심 키워드
                        </p>
                        <p className="text-sm text-gray-700">
                          {note.cue || "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          노트
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">
                          {note.content}
                        </p>
                      </div>
                    </div>

                    {note.summary && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          요약
                        </p>
                        <p className="text-sm text-gray-700">{note.summary}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
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
}

function NoteForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
}: NoteFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          핵심 키워드 (Cue)
        </label>
        <input
          type="text"
          value={formData.cue}
          onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
          placeholder="주요 개념, 질문 등"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
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
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
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
          placeholder="핵심 내용 요약"
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
          저장
        </Button>
      </div>
    </div>
  );
}
