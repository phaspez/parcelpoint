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
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function get_python_datetime(date: Date) {
  // Python's datetime format: YYYY-MM-DD HH:MM:SS.ffffff
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0") +
    "." +
    String(date.getMilliseconds() * 1000).padStart(6, "0")
  );
}

// Mock data and types
type OrderStatus =
  | "ORDERED"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "MISSING";

interface Order {
  id: string;
  customerName: string;
  orderDate: Date;
  status: OrderStatus;
  total: number;
}

interface StorageBlock {
  id: string;
  name: string;
  currentCapacity: number;
  maxCapacity: number;
}

interface DashboardData {
  totalRevenue: number;
  totalCOD: number;
  totalPackages: number;
  totalOrders: number;
  orderStatuses: { name: OrderStatus; value: number }[];
  storageBlocks: StorageBlock[];
  recentOrders: Order[];
}

// Mock API call
const fetchDashboardData = async (
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(get_python_datetime(startDate), get_python_datetime(endDate));

  // Generate random data
  const orderStatuses: { name: OrderStatus; value: number }[] = [
    { name: "ORDERED", value: Math.floor(Math.random() * 100) },
    { name: "CANCELLED", value: Math.floor(Math.random() * 100) },
    { name: "DELIVERED", value: Math.floor(Math.random() * 100) },
    { name: "MISSING", value: Math.floor(Math.random() * 100) },
    { name: "DELIVERING", value: Math.floor(Math.random() * 20) },
  ];

  const totalOrders = orderStatuses.reduce(
    (sum, status) => sum + status.value,
    0,
  );

  return {
    totalRevenue: Math.random() * 100000,
    totalCOD: Math.random() * 50000,
    totalPackages: Math.floor(Math.random() * 10000),
    totalOrders,
    orderStatuses,
    storageBlocks: [
      { id: "1", name: "Block A", currentCapacity: 75, maxCapacity: 100 },
      { id: "2", name: "Block B", currentCapacity: 50, maxCapacity: 100 },
      { id: "3", name: "Block C", currentCapacity: 90, maxCapacity: 100 },
      { id: "4", name: "Block D", currentCapacity: 30, maxCapacity: 100 },
    ],
    recentOrders: Array(5)
      .fill(null)
      .map((_, index) => ({
        id: `ORD-${1000 + index}`,
        customerName: `Customer ${index + 1}`,
        orderDate: new Date(
          startDate.getTime() +
            Math.random() * (endDate.getTime() - startDate.getTime()),
        ),
        status:
          orderStatuses[Math.floor(Math.random() * orderStatuses.length)].name,
        total: Math.random() * 1000,
      })),
  };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StaffDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  useEffect(() => {
    if (date) {
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      fetchDashboardData(startDate, endDate).then(setDashboardData);
    }
  }, [date]);

  if (!dashboardData) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total COD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.totalCOD.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalPackages}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalOrders}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.orderStatuses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.orderStatuses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{format(order.orderDate, "PPP")}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell className="text-right">
                    ${order.total.toFixed(2)}
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
