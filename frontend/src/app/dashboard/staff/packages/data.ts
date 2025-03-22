import { FetchPackage, Package } from "@/types/packages";
import axios from "axios";
import { Account } from "@/types/account";
import { Pagination } from "@/types/pagination";

export interface PackageHistoryCreate {
  action: string;
  notes: string;
  package_id: string;
  staff_id: string;
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
        `/api/v1/package/search${queryString ? `?${queryString}` : ""}`,
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
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export async function createPackageHistory(
  history: PackageHistoryCreate,
  access_token: string,
) {
  try {
    console.log(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package/history`,
    );
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package/history/`,
      history,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export async function updatePackage(
  id: string,
  package_updated: Package,
  access_token: string,
) {
  try {
    console.log(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package/${id}`);
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package/${id}`,
      package_updated,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export interface Address {
  id: string;
  province: string;
  district: string;
  commune: string;
}

export async function getAddressByID(id: string) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/address/${id}`,
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data as Address;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}

export interface Merchant {
  account_id: string;
  company_name: string;
  merchant_description: string;
  registration_date: string;
}

export async function getMerchantByID(id: string) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/merchant/${id}`,
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data as Merchant;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}

export async function getAccountByID(id: string) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/${id}`,
    );
    if (!response.data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data as Account;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}
