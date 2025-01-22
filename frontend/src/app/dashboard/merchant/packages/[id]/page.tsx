"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { fetchPackageById } from "@/lib/data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package } from "@/types/packages";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const VNDong = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function PackageDetailPage() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<Package | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const data = await fetchPackageById(id as string, "");
      if (data) setPackageData(data);
    }

    fetchData();
  }, []);

  if (!packageData) {
    return <div className="container py-8">Loading...</div>;
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
            <BreadcrumbLink href="/dashboard/merchant/">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/merchant/packages">
              Packages
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Package Details</h1>
      </span>
      <Link
        href="/dashboard/merchant/packages"
        className="flex items-center"
        passHref
      >
        <Button variant="default" className="mb-4 flex items-center h-full">
          Back to Packages
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{packageData.name}</h2>
          </CardTitle>
          <CardDescription>
            <div className="text-sm text-gray-500">
              Package ID: {packageData.id}
            </div>
            <div className="text-sm text-gray-500">
              Order ID: {packageData.order_id}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{packageData.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Weight</h3>
              <p>{packageData.weight} kg</p>
            </div>
            <div>
              <h3 className="font-semibold">Dimensions</h3>
              <p>
                {packageData.width} x {packageData.height} x{" "}
                {packageData.length} cm
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Shipping Cost</h3>
              <p>{VNDong.format(packageData.shipping_cost)}</p>
            </div>
            <div>
              <h3 className="font-semibold">COD Cost</h3>
              <p>{VNDong.format(packageData.cod_cost)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Urgent</h3>
              <p>{packageData.is_urgent ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Fragile</h3>
              <p>{packageData.is_fragile ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>{packageData.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Order date</h3>
              <p>{packageData.order_date}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Description</h3>
            <p>{packageData.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
