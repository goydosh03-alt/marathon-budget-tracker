import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-brand">Ти всередині! 🎉</h1>
        <p className="text-gray-600">
          Залогінений як <b>{user.email}</b>
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Тут далі буде дашборд із витратами і графіками.
        </p>

        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            Вийти
          </button>
        </form>
      </div>
    </main>
  );
}
