"use client";

import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Brush,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { fetchPackageDaysAgo } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardMerchant } from "@/types/dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const chartConfig = {
  count: {
    label: "Packages",
    color: "#2563eb",
  },
  cod: {
    label: "COD revenue",
    color: "#f66d9b",
  },
} satisfies ChartConfig;

interface SumHighlight {
  sumPackage: number;
  sumCod: number;
  sumShipping: number;
}

function numberWithDots(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const VNDong = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function MerchantDashboardPage() {
  const [data, setData] = useState<DashboardMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [days_ago, set_days_ago] = useState<number>(30);
  const [sumHighlight, setSumHighlight] = useState<SumHighlight>({
    sumPackage: 0,
    sumCod: 0,
    sumShipping: 0,
  });
  const cookies = useCookies();
  const token = cookies.get("token");

  useEffect(() => {
    async function fetchData() {
      if (token && days_ago > 0 && days_ago < 40) {
        const data: DashboardMerchant[] = await fetchPackageDaysAgo(
          days_ago,
          token,
        );

        const sumPackage = data.reduce((acc, item) => acc + item.count, 0);
        const sumCod = data.reduce((acc, item) => acc + item.cod, 0);
        const sumShipping = data.reduce((acc, item) => acc + item.shipping, 0);
        setSumHighlight({ sumPackage, sumCod, sumShipping });
        setData(data);
      }
    }

    fetchData();
  }, [days_ago]);

  if (!token) return <div>You're not logged in...</div>;
  if (!data) return <div>Error</div>;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Dashboard</h1>
      </span>
      <div className="">
        <Card>
          <CardHeader>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">filter_list</span>
              <Label htmlFor="days_ago">Days</Label>
              <Input
                type="number"
                className="w-[128px]"
                name="days_ago"
                onChange={(event) =>
                  event.target.value && set_days_ago(Number(event.target.value))
                }
                value={days_ago}
              />
            </span>
          </CardHeader>
          <div className="grid lg:grid-cols-2 xl:flex">
            <CardContent>
              <h1 className="text-lg md:text-2xl lg:text-4xl">
                {numberWithDots(sumHighlight.sumPackage)}
              </h1>
              <span>Packages</span>
            </CardContent>
            <CardContent>
              <h1 className="text-lg md:text-2xl lg:text-4xl">
                {VNDong.format(sumHighlight.sumCod - sumHighlight.sumShipping)}
              </h1>
              <span>Net revenue</span>
            </CardContent>
            <CardContent>
              <h1 className="text-green-800 text-lg md:text-2xl lg:text-4xl">
                {VNDong.format(sumHighlight.sumCod)}
              </h1>
              <span>Gross revenue</span>
            </CardContent>
            <CardContent>
              <h1 className="text-red-800 text-lg md:text-2xl lg:text-4xl">
                {VNDong.format(sumHighlight.sumShipping)}
              </h1>
              <span>Shipping fee</span>
            </CardContent>
          </div>
        </Card>

        <div className="flex flex-wrap gap-y-10 py-10">
          <div className="w-full lg:w-1/2">
            <h3>Total packages</h3>
            <ChartContainer config={chartConfig} className="min-h-200px">
              <BarChart
                className="p-4"
                accessibilityLayer
                data={data}
                syncId="barChart"
              >
                <ChartLegend />
                <ChartTooltip content={<ChartTooltipContent />} />
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickMargin={10} />
                <YAxis dataKey="count" />
                <Brush height={15} travellerWidth={15} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="w-full lg:w-1/2">
            <h3>Revenue and fees</h3>
            <ChartContainer config={chartConfig} className="min-h-200px">
              <LineChart accessibilityLayer data={data} syncId="barChart">
                <ChartTooltip content={<ChartTooltipContent />} />
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickMargin={10} />
                <ChartLegend />
                <YAxis dataKey="cod" />
                <Line dataKey="cod" />
                <Line dataKey="shipping" stroke="#f66d9b" />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
