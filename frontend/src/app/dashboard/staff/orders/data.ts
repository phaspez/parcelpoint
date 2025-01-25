import { Order } from "@/types/order";

export async function fetchAllOrders() {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/order",
      {
        method: "get",
        headers: {},
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchOrder(id: string) {
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
