import { Account } from "@/types/account";

export async function deleteAccount(id: string, access_token: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/${id}`,
      {
        method: "delete",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching accounts:", error);
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
    return (await response.json()) as Account[];
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
}

export async function fetchAccountById(id: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/${id}`,
      {
        method: "get",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as Account;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
}
