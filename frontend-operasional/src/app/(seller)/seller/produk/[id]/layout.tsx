export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full page layout without sidebar
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
