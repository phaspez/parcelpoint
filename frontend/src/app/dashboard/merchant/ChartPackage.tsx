"use client";

import axios from "axios";
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
import { use } from "react";
import { fetchPackageDaysAgo } from "@/lib/data";

export async function getPackageDaysAgo(
  daysAgo: number = 20,
  access_token: string,
) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/v1/merchant/dashboard/package_per_day?days_ago=${daysAgo}`,
      {
        withCredentials: true,
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

export default async function ChartPackage(
  date: number = 30,
  access_token: string,
) {
  const data = await fetchPackageDaysAgo(date, access_token);

  return <div>{data}</div>;
  // const data = use(getPackageDaysAgo(date, access_token));
  // console.log(data);
  // return <div>{data}</div>;

  //
  // if (!data || !Array.isArray(data)) {
  //   return <div className="p-4 text-red-500">No data available</div>;
  // }
  //
  // return (
  //   <div>
  //     <div className="">
  //       <div className="flex flex-wrap gap-y-10 py-10">
  //         <ChartContainer
  //           config={chartConfig}
  //           className="min-h-200px w-full md:w-1/2"
  //         >
  //           <h4>Packages ordered within 30 days</h4>
  //           <BarChart
  //             className="p-4"
  //             accessibilityLayer
  //             data={data}
  //             syncId="barChart"
  //           >
  //             <ChartLegend />
  //             <ChartTooltip content={<ChartTooltipContent />} />
  //             <CartesianGrid vertical={false} />
  //             <XAxis dataKey="date" tickMargin={10} />
  //             <YAxis dataKey="count" />
  //             <Brush height={15} travellerWidth={15} />
  //             <Bar dataKey="count" fill="var(--color-count)" radius={4} />
  //           </BarChart>
  //         </ChartContainer>
  //
  //         <ChartContainer
  //           config={chartConfig}
  //           className="min-h-200px w-full md:w-1/2"
  //         >
  //           <h4>COD revenues and shipping fees within 30 days</h4>
  //           <LineChart accessibilityLayer data={data} syncId="barChart">
  //             <ChartTooltip content={<ChartTooltipContent />} />
  //             <CartesianGrid vertical={false} />
  //             <XAxis dataKey="date" tickMargin={10} />
  //             <ChartLegend />
  //             <YAxis dataKey="cod" />
  //             <Line dataKey="cod" />
  //             <Line dataKey="shipping" stroke="#f66d9b" />
  //           </LineChart>
  //         </ChartContainer>
  //       </div>
  //     </div>
  //   </div>
}
