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

export default function MerchantDashboardPage() {
  return (
    <div>
      <h1>Create New</h1>
    </div>
  );
}
