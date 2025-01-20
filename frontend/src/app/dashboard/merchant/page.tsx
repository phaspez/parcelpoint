"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";

async function getPackageDaysAgo(daysAgo: number = 20, access_token: string) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/v1/merchant/dashboard/package_per_day?days_ago=${daysAgo}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to handle it in the component
  }
}

export default function MerchantDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartConfig = {
    count: {
      label: "Packages",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  const cookie = useCookies();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const access_token = cookie.get("token");
        if (!access_token) return;
        const result = await getPackageDaysAgo(30, access_token);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading || !data) return <div>Loading...</div>;

  return (
    <div>
      <h3>This is a dashboard page</h3>
      <div>
        {/* Use your data here */}
        {JSON.stringify(data)}
      </div>
      <div>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
