import "dotenv/config";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="px-4 md:px-20 lg:px-40 pt-10">
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
