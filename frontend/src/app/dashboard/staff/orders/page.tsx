"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EllipsisVertical, Search, Trash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Order } from "@/types/order";
import { fetchAllOrders } from "@/app/dashboard/staff/orders/data";
import { formatTimestamp } from "@/lib/regionFormat";
import { deleteOrder } from "@/app/dashboard/staff/orders/data";

export default function OrdersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
    fetchAllOrders().then((orders) => {
      setOrders(orders);
      setIsLoading(false);
    });
  }, [searchParams]);

  const handleSearch = () => {
    router.push(`/dashboard/staff/orders?page=1&search=${searchTerm}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
      toast({
        title: "Order deleted",
        description: "The order has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
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
            <BreadcrumbPage>Order Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Order Management</h1>
      </span>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by Order ID or Merchant ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>
          <Search />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Merchant ID</TableHead>
            <TableHead>Order Date</TableHead>

            <TableHead>Staff ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id?.slice(0, 8)}...</TableCell>
              <TableCell>{order.merchant_id?.slice(0, 8)}...</TableCell>
              <TableCell>{formatTimestamp(order.date)}</TableCell>
              <TableCell>{order.staff_id?.slice(0, 8)}...</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/staff/orders/${order.id}`}>
                      <EllipsisVertical />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(order.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
