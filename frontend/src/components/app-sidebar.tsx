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
  Users,
  Truck,
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
import { SiTeal } from "react-icons/si";

export function AppSidebar() {
  const { user } = useUserStore();

  return (
    <Sidebar>
      <SidebarHeader title={"ParcelPoint"}>
        <div className="h-0 lg:h-10"></div>
      </SidebarHeader>
      <SidebarContent title={"ParcelPoint"}>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent title={"Group"}>
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
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/staff">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.type == "STAFF" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Packages Control</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem title="Packages">
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/staff/packages">
                        <Package2 />
                        <span>Package</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/staff/orders">
                        <ReceiptText />
                        <span>Orders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Warehouses</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/staff/storage">
                        <Warehouse />
                        <span>Storage</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/staff/shipping">
                        <Truck />
                        <span>Shipping Options</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Users</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/staff/accounts">
                        <Users />
                        <span>Accounts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
