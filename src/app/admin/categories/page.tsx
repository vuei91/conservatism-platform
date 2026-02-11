"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { Button, Input, Card, CardContent, Skeleton } from "@/components/ui";
import { useCategories } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) return;

    const supabase = createClient();
    await supabase.from("categories").insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      order: categories.length,
    });

    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setFormData({ name: "", slug: "", description: "" });
    setIsCreating(false);
  };

  const handleUpdate = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("categories")
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      })
      .eq("id", id);

    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "정말 삭제하시겠습니까? 이 카테고리에 속한 강의들의 카테고리가 해제됩니다.",
      )
    )
      return;

    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const startEdit = (category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
          <p className="mt-2 text-gray-600">강의 카테고리를 관리하세요</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            카테고리 추가
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium text-gray-900">새 카테고리</h3>
            <div className="space-y-4">
              <Input
                label="카테고리명 *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="슬러그 * (URL에 사용)"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="예: politics, economics"
              />
              <Input
                label="설명"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.slug}
                >
                  추가
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ name: "", slug: "", description: "" });
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">등록된 카테고리가 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <Input
                      label="카테고리명 *"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="슬러그 *"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                    />
                    <Input
                      label="설명"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(category.id)}>
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: "", slug: "", description: "" });
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
