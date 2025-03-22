"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCookies } from "next-client-cookies";
import Link from "next/link";
import { fetchOrder, OrderDetails } from "@/app/dashboard/common/fetchOrder";
import { deletePackage } from "@/app/dashboard/staff/orders/[id]/data";
import OrderDetailsCard from "@/components/OrderDetails";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cookie = useCookies();
  const token = cookie.get("token");

  useEffect(() => {
    if (token)
      fetchOrder(params.id as string, token)
        .then((orderData) => {
          setOrder(orderData);
          setIsLoading(false);
        })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
  }, [params.id]);

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!order) {
    return <div className="container py-10">Order not found</div>;
  }

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/merchant", "/dashboard/merchant/orders"]}
        breadcrumbPage={["Dashboard", "Order"]}
        currentPage={order.order.id}
      />

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Order Details</h1>
      </span>

      <div className="pb-4">
        <Link href="/dashboard/merchant/orders">
          <Button variant="secondary">Back to Orders</Button>
        </Link>
      </div>

      <OrderDetailsCard order={order} role="merchant" />
    </div>
  );
}
