import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/dashboard/Navbar";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full">
        <Navbar />
        <SidebarTrigger className="absolute top-5   text-white p-3 rounded-md " />
        {children}
      </main>
    </SidebarProvider>
  );
}
