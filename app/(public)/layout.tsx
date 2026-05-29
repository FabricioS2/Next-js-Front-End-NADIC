import ThreeCanvas from "@/components/ThreeCanvas";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThreeCanvas />
      <div className="main-overlay" style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}