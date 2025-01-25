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

interface Package {
  id: string;
  name: string;
  weight: number;
  dimensions: string;
}

interface Order {
  id: string;
  merchantId: string;
  customerName: string;
  orderDate: string;
  total: number;
  packages: Package[];
}

// Mock API calls
const fetchOrder = async (id: string): Promise<Order> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id,
    merchantId: `MERCH-${Math.floor(Math.random() * 100)}`,
    customerName: `Customer ${Math.floor(Math.random() * 100)}`,
    orderDate: new Date().toISOString(),
    total: Math.random() * 1000,
    packages: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, i) => ({
        id: `PKG-${i + 1}`,
        name: `Package ${i + 1}`,
        weight: Math.random() * 10,
        dimensions: `${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)}`,
      }),
    ),
  };
};

const deletePackage = async (
  orderId: string,
  packageId: string,
): Promise<void> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export default function OrderDetailsPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder(params.id as string).then((orderData) => {
      setOrder(orderData);
      setIsLoading(false);
    });
  }, [params.id]);

  const handleDeletePackage = async (packageId: string) => {
    if (!order) return;

    try {
      await deletePackage(order.id, packageId);
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
            <BreadcrumbPage>{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Order Details</h1>
      </span>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Order Details: {order.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p>
                <strong>Merchant ID:</strong> {order.merchantId}
              </p>
              <p>
                <strong>Customer Name:</strong> {order.customerName}
              </p>
            </div>
            <div>
              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Total:</strong> ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-4">Packages</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.id}</TableCell>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>{pkg.weight.toFixed(2)} kg</TableCell>
                  <TableCell>{pkg.dimensions}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
