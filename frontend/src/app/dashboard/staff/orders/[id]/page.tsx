"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchOrderByID } from "@/app/dashboard/staff/orders/data";
import { fetchPackages } from "@/lib/data";
import { useUserStore } from "@/stores/userStore";
import { useCookies } from "next-client-cookies";
import { fetchStaffPackages } from "@/app/dashboard/staff/orders/[id]/data";
import { Package } from "@/types/packages";
import { Order } from "@/types/order";
import { formatTimestamp } from "@/lib/regionFormat";
import { VNDong } from "@/lib/regionFormat";
import Link from "next/link";
import { EllipsisVertical, Trash } from "lucide-react";
import { deletePackage } from "@/app/dashboard/staff/orders/[id]/data";
import OrderDetailsCard from "@/components/OrderDetails";

interface OrderDetails {
  order: Order;
  packages: Package[];
}

const fetchOrder = async (
  id: string,
  access_token: string,
): Promise<OrderDetails> => {
  console.log(id);
  const order = await fetchOrderByID(id);
  const packages = await fetchStaffPackages({ order_id: id }, access_token);
  console.log(packages);

  return { order: order, packages: packages };
};

export default function OrderDetailsPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cookie = useCookies();
  const token = cookie.get("token");

  useEffect(() => {
    if (token)
      fetchOrder(params.id as string, token).then((orderData) => {
        setOrder(orderData);
        setIsLoading(false);
      });
  }, [params.id]);

  const handleDeletePackage = async (packageId: string) => {
    if (!order || !token) return;

    try {
      await deletePackage(packageId, token);
      setOrder((prevOrder) => ({
        ...prevOrder!,
        packages: prevOrder!.packages.filter((pkg) => pkg.id !== packageId),
      }));
      toast({
        title: "Package deleted",
        description:
          "The package has been successfully removed from the order.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!order) {
    return <div className="container py-10">Order not found</div>;
  }

  return (
    <div className="container">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/staff">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/staff/orders">
              Order Management
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{order.order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Order Details</h1>
      </span>

      <div className="pb-4">
        <Link href="/dashboard/staff/orders">
          <Button variant="secondary">Back to Orders</Button>
        </Link>
      </div>

      <OrderDetailsCard
        order={order}
        role="staff"
        handleDeletePackage={handleDeletePackage}
      />
    </div>
  );
}
