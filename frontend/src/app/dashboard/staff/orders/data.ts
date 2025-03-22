import { Order } from "@/types/order";
import { Pagination } from "@/types/pagination";

export async function fetchAllOrders(page?: number, limit?: number) {
  try {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (limit !== undefined) params.append("limit", limit.toString());

    console.log(params.toString());

    const url =
      process.env.NEXT_PUBLIC_BACKEND_URL +
      "/api/v1/order" +
      (params.toString() ? `?${params.toString()}` : "");

    const response = await fetch(url, {
      method: "get",
      headers: {},
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as Pagination<Order>;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/order/${id}`,
      {
        method: "delete",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchOrderByID(id: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/order/${id}`,
      {
        method: "get",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as Order;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}
