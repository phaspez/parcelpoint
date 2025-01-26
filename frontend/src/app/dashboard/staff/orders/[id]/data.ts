import { FetchPackage, Package } from "@/types/packages";
import axios from "axios";

export async function fetchStaffPackages(
  searchParams: Partial<FetchPackage>,
  access_token: string,
) {
  try {
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
        `/api/v1/package/search${queryString ? `?${queryString}` : ""}`,
      {
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
