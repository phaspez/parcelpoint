import { Address } from "@/app/dashboard/staff/packages/data";

export interface BaseAccount {
  phone: string;
  id: string;
  address_id: string;
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

interface BaseAccountPassword extends BaseAccount {
  password: string;
}

export interface StaffCreate {
  account_create: BaseAccountPassword;
  staff_create: Staff["staff"];
}

export async function createStaff(token: string, data: StaffCreate) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/staff/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error patching merchant:", error);
    throw error;
  }
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

export async function patchMerchant(
  token: string,
  id: string,
  data: Partial<Merchant["merchant"]>,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/merchant/separate/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error patching merchant:", error);
    throw error;
  }
}

export async function patchStaff(
  token: string,
  id: string,
  data: Partial<Staff["staff"]>,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/staff/separate/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error patching staff:", error);
    throw error;
  }
}

export async function patchAccount(
  token: string,
  id: string,
  data: Partial<BaseAccount>,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/account/admin/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error patching staff:", error);
    throw error;
  }
}
