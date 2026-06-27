export default function RemindersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ minHeight: "100vh", background: "#05090b" }}>{children}</div>;
}
