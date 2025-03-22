"use server";

import axios from "axios";
import { Package, FetchPackage, PackageHistory } from "@/types/packages";
import { Order } from "@/types/order";
import { PricingOption } from "@/types/pricingOptions";
import { Pagination } from "@/types/pagination";

export async function fetchPackageDaysAgo(
  daysAgo: number = 20,
  access_token: string,
) {
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
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchPackages(
  searchParams: Partial<FetchPackage>,
  access_token: string,
) {
  const queryString = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([_, value]) => value !== undefined)
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: String(value),
        }),
        {},
      ),
  ).toString();
  console.log(queryString);

  const response = await axios.get(
    process.env.NEXT_PUBLIC_BACKEND_URL +
      `/api/v1/package/my_packages${queryString ? `?${queryString}` : ""}`,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );
  if (!response.data) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.data as Pagination<Package>;
}

export async function fetchPackageById(id: string, access_token: string) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package/${id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data as Package;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export async function fetchOrders(
  access_token: string,
  page: number = 1,
  limit: number = 30,
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    console.log(params.toString());

    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/v1/order/my_orders?${params.toString()}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data as Pagination<Order>;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchPricingOptions(): Promise<PricingOption[]> {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package_rate/`,
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(response.data);
    return response.data as PricingOption[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchPackageHistory(
  package_id: string,
): Promise<PackageHistory[]> {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/v1/package/history/${package_id}`,
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data as PackageHistory[];
  } catch (error) {
    console.error("Error fetching package history:", error);
    throw error;
  }
}
