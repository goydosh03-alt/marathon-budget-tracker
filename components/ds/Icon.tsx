import { ICONS } from "@/lib/ds-icons";

/** Solar Bold glyph as inline SVG, painted with currentColor. */
export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={d.viewBox || "0 0 24 24"}
      fill="currentColor"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: d.body }}
    />
  );
}
