import "dotenv/config";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="px-4 md:px-20 lg:px-40 pt-10">{children}</div>;
}
