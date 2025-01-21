import axios from "axios";
import { FetchPackage } from "@/types/packages";
import { Package } from "@/lib/fake-data";

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
  try {
    // Convert searchParams to query string, filtering out undefined values
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

    return response.data as Package[];
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
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

    return response.data as Package[];
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}
