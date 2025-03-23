import { Address } from "@/app/dashboard/staff/packages/data";

export interface BaseAccount {
  phone: string;
  id: string;
  google_id?: string;
  email: string;
  name: string;
  street: string;
  address: Address; // contains: province: string, district: string, commune: string
}

export interface Merchant extends BaseAccount {
  merchant: {
    registration_date: string;
    company_name: string;
    merchant_description: string;
  };
}

export interface Staff extends BaseAccount {
  staff: {
    department: string;
    access_level: string;
    hire_date: string;
    position: string;
  };
}

interface AllAccountsResponse {
  merchants: Merchant[];
  staff: Staff[];
}

export async function fetchAllAccounts() {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account`,
      {
        method: "get",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as AllAccountsResponse;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
}

export async function fetchAccountById(id: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/detail/${id}`,
      {
        method: "get",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as Merchant | Staff;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
}
