"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Box, ShoppingCart, BarChart, FileText, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SIDEBAR_LINKS } from "@/constants/sidebarLinks"

export function AppSidebar() {
  const pathname = usePathname()

  const role: "admin" | "salesman" = pathname.includes("/admin")
    ? "admin"
    : "salesman"

  const items = SIDEBAR_LINKS[role]

 
  const isActive = (href: string) =>
    pathname === href
      ? "bg-white text-black "
      : "text-white"

  return (
    <Sidebar className="bg-black text-white h-full">
      <SidebarContent className=" bg-black sm:bg-black md:bg-black lg:bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-bold">OM-SYSTEM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.name} className="mt-4">
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <div
                          className={`flex items-center w-full h-12 space-x-5 px-5 rounded-sm ${isActive(item.href)}`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xl">{item.name}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

     
        <div className="mt-auto p-4 mb-5">
 
          {role === "admin" && (
            <SidebarMenuItem>
              <SidebarMenuButton className="outline-none border-none">
                <Link href="/admin/settings">
                  <div className={`flex items-center w-full h-12 space-x-5 px-5 rounded-sm ${isActive("/admin/settings")}`}>
                    <Settings className="w-6 h-6" />
                    <span className="text-xl">Settings</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

        
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2025 OM-SYSTEM. All rights reserved.
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
