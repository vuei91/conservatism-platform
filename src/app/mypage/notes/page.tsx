"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent, Button, Skeleton, Badge } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useNotes } from "@/hooks";
import { formatTimestamp } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Video, Note } from "@/types/database";

export default function NotesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { data: notes = [], isLoading: notesLoading } = useNotes();

  // 노트에 연결된 강의 정보 가져오기
  const videoIds = [...new Set(notes.map((n: Note) => n.video_id))];
  const { data: videos = [] } = useQuery({
    queryKey: ["videos-for-notes", videoIds],
    queryFn: async () => {
      if (videoIds.length === 0) return [];
      const supabase = createClient();
      const { data } = await supabase
        .from("videos")
        .select("id, title")
        .in("id", videoIds as string[]);
      return (data || []) as Pick<Video, "id" | "title">[];
    },
    enabled: videoIds.length > 0,
  });

  const videoMap = new Map(videos.map((v) => [v.id, v.title]));

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/mypage"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          마이페이지로
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">내 메모</h1>
        <p className="mt-2 text-gray-600">
          작성한 코넬노트 메모 {notes.length}개
        </p>
      </div>

      {notesLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">작성한 메모가 없습니다.</p>
            <Link href="/lectures">
              <Button variant="outline" className="mt-4">
                강의 시청하며 메모하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note: Note) => (
            <NoteCard
              key={note.id}
              note={note}
              lectureTitle={videoMap.get(note.video_id) || "알 수 없는 영상"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  lectureTitle,
}: {
  note: Note;
  lectureTitle: string;
}) {
  return (
    <Link href={`/lectures/${note.video_id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{lectureTitle}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimestamp(note.timestamp)}
              </div>
            </div>
            {note.is_complete && <Badge variant="success">완료</Badge>}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded bg-gray-50 p-2">
              <p className="mb-1 text-xs font-medium text-gray-500">
                핵심 키워드
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {note.cue || "-"}
              </p>
            </div>
            <div className="md:col-span-2 rounded bg-gray-50 p-2">
              <p className="mb-1 text-xs font-medium text-gray-500">노트</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {note.content}
              </p>
            </div>
          </div>

          {note.summary && (
            <div className="mt-3 rounded bg-yellow-50 p-2">
              <p className="mb-1 text-xs font-medium text-gray-500">요약</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {note.summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
