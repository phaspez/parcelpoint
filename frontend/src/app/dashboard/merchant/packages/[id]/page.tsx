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
import { fetchPackageById, fetchPackageHistory } from "@/lib/data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, PackageHistory } from "@/types/packages";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PackageBadge from "@/components/PackageBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const VNDong = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export default function PackageDetailPage() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [historyData, setHistoryData] = useState<PackageHistory[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const data = await fetchPackageById(id as string, "");
      if (data) setPackageData(data);
      const history = await fetchPackageHistory(id as string);
      if (history) setHistoryData(history);
      console.log(history);
    }

    fetchData();
  }, []);

  if (!packageData) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container w-full">
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-4">
              <h2>{packageData.name}</h2>
              <PackageBadge badge_name={packageData.status} />
            </span>
          </CardTitle>
          <CardDescription>
            <div className="text-sm text-gray-500">
              Package ID: {packageData.id}
            </div>
            <div className="text-sm text-gray-500">
              Order ID: {packageData.order_id}
            </div>
            <div>
              <p className="text-lg pt-2">{packageData.description}</p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h2>Details</h2>
          <Separator />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
            <div>
              <p className="font-semibold">Weight</p>
              <h3>{packageData.weight} kg</h3>
            </div>
            <div>
              <p className="font-semibold">Dimensions</p>
              <h3>
                {packageData.width} x {packageData.height} x{" "}
                {packageData.length} cm
              </h3>
            </div>
            <div>
              <p className="font-semibold">Shipping Cost</p>
              <h3>{VNDong.format(packageData.shipping_cost)}</h3>
            </div>
            <div>
              <p className="font-semibold">COD Cost</p>
              <h3>{VNDong.format(packageData.cod_cost)}</h3>
            </div>
            <div>
              <p className="font-semibold">Urgent</p>
              <h3>{packageData.is_urgent ? "Yes" : "No"}</h3>
            </div>
            <div>
              <p className="font-semibold">Fragile</p>
              <h3>{packageData.is_fragile ? "Yes" : "No"}</h3>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <h3>{packageData.phone}</h3>
            </div>
            {/*<div>*/}
            {/*  <p className="font-semibold">Order date</p>*/}
            {/*  <h3>{packageData.order_date}</h3>*/}
            {/*</div>*/}
          </div>
        </CardContent>
        <CardContent>
          <h2>Tracking history</h2>
          <Separator />
          <Table>
            <TableHeader className="h-12">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((history) => (
                <TableRow key={history.id} className="h-12">
                  <TableCell>{history.timestamp}</TableCell>
                  <TableCell>{history.notes}</TableCell>
                  <TableCell>{history.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
