"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCookies } from "next-client-cookies";
import Link from "next/link";
import { deletePackage } from "@/app/dashboard/staff/orders/[id]/data";
import OrderDetailsCard from "@/components/OrderDetails";
import { fetchOrder, OrderDetails } from "@/app/dashboard/common/fetchOrder";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

export default function OrderDetailsPage() {
  const { toast } = useToast();
  const params = useParams();
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
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/staff", "/dashboard/staff/orders"]}
        breadcrumbPage={["Dashboard", "Order Management"]}
        currentPage={order.order.id}
      />

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
