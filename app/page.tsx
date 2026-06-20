import { redirect } from "next/navigation";

// Головна просто веде на dashboard.
// Якщо не залогінений — middleware відправить на /login.
export default function Home() {
  redirect("/dashboard");
}
