"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { processRecurring } from "@/app/dashboard/actions";

// Тихо створює пропущені регулярні платежі при відкритті застосунку (раз).
export default function RecurringRunner() {
  const ran = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    processRecurring()
      .then((r) => {
        if (r.created > 0) router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
