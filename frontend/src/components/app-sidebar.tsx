"use client";

import {
  Calendar,
  Home,
  Receipt,
  Search,
  Settings,
  Package2,
  ReceiptText,
  Warehouse,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

export function AppSidebar() {
  const { user } = useUserStore();
  console.log(user);

  return (
    <Sidebar>
      <SidebarHeader title={"ParcelPoint"}>
        <div className="h-0 lg:h-10"></div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            {user?.type == "MERCHANT" && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/merchant">
                      <Home />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/merchant/packages">
                      <Package2 />
                      <span>Package</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/merchant/orders">
                      <ReceiptText />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/merchant/you">
                      <User />
                      <span>Account</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {user?.type == "STAFF" && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/staff">
                      <Home />
                      <span>Staff Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/staff/packages">
                      <Package2 />
                      <span>Package</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/staff/storage">
                      <Warehouse />
                      <span>Storage</span>
                    </Link>
                  </SidebarMenuButton>

                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/staff/orders">
                      <ReceiptText />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                  {/*<SidebarMenuButton asChild>*/}
                  {/*  <Link href="/dashboard/merchant/you">*/}
                  {/*    <Settings />*/}
                  {/*    <span>Settings</span>*/}
                  {/*  </Link>*/}
                  {/*</SidebarMenuButton>*/}
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
