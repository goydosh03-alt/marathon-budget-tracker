export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ minHeight: "100vh", background: "#05090b" }}>{children}</div>;
}
