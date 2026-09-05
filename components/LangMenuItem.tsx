"use client";

import { useState } from "react";
import MenuRow from "@/components/ds/MenuRow";
import { LANGS } from "@/lib/i18n";
import { useLang, useT } from "@/components/SettingsProvider";
import LangSheet from "@/components/LangSheet";

export default function LangMenuItem() {
  const [open, setOpen] = useState(false);
  const lang = useLang();
  const t = useT();
  const cur = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <>
      <MenuRow
        icon="BoldMessagesConversationPlain"
        title={t("menu.language")}
        sub={`${cur.flag} ${cur.label}`}
        onClick={() => setOpen(true)}
      />
      <LangSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
