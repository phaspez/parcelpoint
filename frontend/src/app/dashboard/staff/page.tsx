"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import fetchStaffDashboard from "@/lib/dataStaff";
import { Package } from "@/types/packages";
import { VNDong } from "@/lib/regionFormat";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DasboardInfo {
  orders: {
    count: number;
    customer: string;
    date: string;
    details: string;
    id: string;
    merchant_id: string;
    staff_id: string;
  };
  recent_packages: Package[];
}

interface Summary {
  totalShippingCost: number;
  totalCodCost: number;
  totalPackages: number;
  statusCount: { name: string; value: number }[];
}

function calculatePackageSummary(packages: Package[]): Summary {
  const statusCount: Record<string, number> = {};

  const result = packages.reduce(
    (summary, pkg) => {
      summary.totalShippingCost += pkg.shipping_cost;
      summary.totalCodCost += pkg.cod_cost;
      summary.totalPackages++;

      if (statusCount[pkg.status]) {
        statusCount[pkg.status]++;
      } else {
        statusCount[pkg.status] = 1;
      }

      return summary;
    },
    {
      totalShippingCost: 0,
      totalCodCost: 0,
      totalPackages: 0,
      statusCount: [],
    } as Summary,
  );

  result.statusCount = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  return result;
}

// Mock data and types
type OrderStatus =
  | "ORDERED"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "MISSING";

interface StorageBlock {
  id: string;
  name: string;
  currentCapacity: number;
  maxCapacity: number;
}

interface DashboardData {
  summary: Summary;
  orderStatuses: { name: OrderStatus; value: number }[];
  storageBlocks: StorageBlock[];
  recentOrders: Order[];
}

const chartConfig = {
  ORDERED: {
    label: "Ordered",
    color: "hsl(var(--chart-1))",
  },
  DELIVERING: {
    label: "Delivering",
    color: "hsl(var(--chart-2))",
  },
  MISSING: {
    label: "Missing",
    color: "hsl(var(--chart-3))",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "hsl(var(--chart-4))",
  },
  DELIVERED: {
    label: "Delivered",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function StaffDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const fetchDashboardData = async (
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardData> => {
    console.log(startDate, endDate);
    const data = (await fetchStaffDashboard(
      startDate,
      endDate,
    )) as DasboardInfo;
    console.log(data);

    const summary = calculatePackageSummary(data.recent_packages);

    const result: DashboardData = {
      storageBlocks: [
        { id: "1", name: "Block A", currentCapacity: 75, maxCapacity: 100 },
        { id: "2", name: "Block B", currentCapacity: 50, maxCapacity: 100 },
        { id: "3", name: "Block C", currentCapacity: 90, maxCapacity: 100 },
        { id: "4", name: "Block D", currentCapacity: 30, maxCapacity: 100 },
      ],
      summary: summary,
      recentOrders: data.orders,
    };
    console.log(result);
    return result;
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(25, 59, 59, 999);
      fetchDashboardData(start, end).then(setDashboardData);
    }
  }, [startDate, endDate]);

  if (!dashboardData) {
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
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Staff Dashboard</h1>
      </span>

      <div className="flex justify-between items-center mb-6">
        <div className="grid grid-cols-1 lg:flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-min justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                From:{" "}
                {startDate ? format(startDate, "P") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-min justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" /> To:{" "}
                {endDate ? format(endDate, "P") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              {VNDong.format(dashboardData.summary.totalShippingCost)}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total COD</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              {VNDong.format(dashboardData.summary.totalCodCost)}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              {dashboardData.summary.totalPackages}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              {dashboardData.recentOrders.length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={dashboardData.summary.statusCount}
                  //labelLine={false}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  // fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.summary.statusCount.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.storageBlocks.map((block) => (
                <div key={block.id} className="flex items-center">
                  <div className="w-40">{block.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(block.currentCapacity / block.maxCapacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-40 text-right">
                    {block.currentCapacity}/{block.maxCapacity}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Staff ID</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.staff_id}</TableCell>
                  <TableCell className="text-right">{order.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
