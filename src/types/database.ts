export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: "user" | "admin";
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          youtube_id: string;
          youtube_url: string;
          thumbnail_url: string | null;
          duration: number | null;
          category_id: string | null;
          difficulty: "beginner" | "intermediate" | "advanced";
          instructor: string | null;
          view_count: number;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          youtube_id: string;
          youtube_url: string;
          thumbnail_url?: string | null;
          duration?: number | null;
          category_id?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          instructor?: string | null;
          view_count?: number;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          youtube_id?: string;
          youtube_url?: string;
          thumbnail_url?: string | null;
          duration?: number | null;
          category_id?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          instructor?: string | null;
          view_count?: number;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lectures_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      lectures: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          learning_goals: string | null;
          thumbnail_url: string | null;
          difficulty: "beginner" | "intermediate" | "advanced";
          is_featured: boolean;
          is_published: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          learning_goals?: string | null;
          thumbnail_url?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          learning_goals?: string | null;
          thumbnail_url?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lecture_videos: {
        Row: {
          id: string;
          lecture_id: string;
          video_id: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lecture_id: string;
          video_id: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lecture_id?: string;
          video_id?: string;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lecture_videos_lecture_id_fkey";
            columns: ["lecture_id"];
            referencedRelation: "lectures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lecture_videos_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          lecture_id: string | null;
          curriculum_id: string | null;
          progress: number;
          is_completed: boolean;
          last_watched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          lecture_id?: string | null;
          curriculum_id?: string | null;
          progress?: number;
          is_completed?: boolean;
          last_watched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          lecture_id?: string | null;
          curriculum_id?: string | null;
          progress?: number;
          is_completed?: boolean;
          last_watched_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watch_history_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watch_history_lecture_id_fkey";
            columns: ["lecture_id"];
            referencedRelation: "lectures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watch_history_curriculum_id_fkey";
            columns: ["curriculum_id"];
            referencedRelation: "curriculums";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          lecture_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lecture_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lecture_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_lecture_id_fkey";
            columns: ["lecture_id"];
            referencedRelation: "lectures";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          timestamp: number;
          cue: string | null;
          content: string;
          summary: string | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          timestamp?: number;
          cue?: string | null;
          content: string;
          summary?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          timestamp?: number;
          cue?: string | null;
          content?: string;
          summary?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          watch_completed: boolean;
          note_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          watch_completed?: boolean;
          note_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          watch_completed?: boolean;
          note_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_progress_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      review_schedules: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          review_date: string;
          review_count: number;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          review_date: string;
          review_count?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          review_date?: string;
          review_count?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_schedules_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_schedules_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      curriculums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          difficulty: "beginner" | "intermediate" | "advanced";
          is_featured: boolean;
          is_published: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      curriculum_lectures: {
        Row: {
          id: string;
          curriculum_id: string;
          lecture_id: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          curriculum_id: string;
          lecture_id: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          curriculum_id?: string;
          lecture_id?: string;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curriculum_lectures_curriculum_id_fkey";
            columns: ["curriculum_id"];
            referencedRelation: "curriculums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curriculum_lectures_lecture_id_fkey";
            columns: ["lecture_id"];
            referencedRelation: "lectures";
            referencedColumns: ["id"];
          },
        ];
      };
      email_verification_tokens: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          token: string;
          expires_at: string;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          token: string;
          expires_at: string;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          token?: string;
          expires_at?: string;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_view_count: {
        Args: {
          p_video_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced";
      user_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Video = Tables<"videos">;
export type Lecture = Tables<"lectures">;
export type LectureVideo = Tables<"lecture_videos">;
export type Curriculum = Tables<"curriculums">;
export type CurriculumLecture = Tables<"curriculum_lectures">;
export type WatchHistory = Tables<"watch_history">;
export type Favorite = Tables<"favorites">;
export type Note = Tables<"notes">;
export type LearningProgress = Tables<"learning_progress">;
export type ReviewSchedule = Tables<"review_schedules">;

// Extended types with relations
export type VideoWithCategory = Video & {
  category: Category | null;
};

export type LectureWithVideos = Lecture & {
  videos: (LectureVideo & { video: Video })[];
};

export type CurriculumWithLectures = Curriculum & {
  curriculum_lectures: (CurriculumLecture & {
    lecture: Lecture & {
      lecture_videos: (LectureVideo & { video: Video })[];
    };
  })[];
};

export type NoteWithVideo = Note & {
  video: Video;
};
