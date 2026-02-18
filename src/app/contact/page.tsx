"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const contactSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  subject: z.string().min(5, "제목은 5자 이상이어야 합니다"),
  message: z.string().min(10, "내용은 10자 이상이어야 합니다"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: data,
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
    } catch {
      setError("메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              문의가 접수되었습니다
            </h2>
            <p className="mt-2 text-gray-600">
              빠른 시일 내에 답변 드리겠습니다.
            </p>
            <Button className="mt-6" onClick={() => setIsSuccess(false)}>
              새 문의하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
        <p className="mt-2 text-gray-600">
          궁금한 점이나 건의사항이 있으시면 언제든 문의해주세요.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이름"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="이메일"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="답변 받으실 이메일"
            />
            <Input
              label="제목"
              {...register("subject")}
              error={errors.subject?.message}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                내용
              </label>
              <textarea
                {...register("message")}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-sequoia-500 focus:outline-none focus:ring-1 focus:ring-sequoia-500"
                placeholder="문의 내용을 입력해주세요"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.message.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "전송 중..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  문의 보내기
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
