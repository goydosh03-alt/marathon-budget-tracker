"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ПРИЧИНА ІСНУВАННЯ: `backdrop-filter` створює containing block для
 * нащадків з `position: fixed`. Скляна пігулка в шапці, картка меню,
 * будь-яка наша поверхня зі склом — усі вони «ловлять» шит усередину себе,
 * і замість повноекранного попапа виходить темний прямокутник 90×40.
 *
 * Тому КОЖЕН шит малюється порталом у <body>, поза будь-яким склом.
 * Це не оптимізація — без цього шит, вкладений у скло, просто не працює.
 */
export default function SheetPortal({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return createPortal(children, document.body);
}
