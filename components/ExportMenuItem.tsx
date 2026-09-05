"use client";

import { useState } from "react";
import MenuRow from "@/components/ds/MenuRow";
import { useT } from "@/components/SettingsProvider";
import ExportSheet from "@/components/ExportSheet";

export default function ExportMenuItem() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <MenuRow
        icon="BoldArrowsArrowDown"
        title={t("menu.export")}
        sub={t("menu.export.sub")}
        onClick={() => setOpen(true)}
      />
      {open && <ExportSheet onClose={() => setOpen(false)} />}
    </>
  );
}
