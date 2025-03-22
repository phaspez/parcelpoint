import { fetchOrderByID } from "@/app/dashboard/staff/orders/data";
import { fetchStaffPackages } from "@/app/dashboard/staff/orders/[id]/data";
import { Order } from "@/types/order";
import { Package } from "@/types/packages";

export interface OrderDetails {
  order: Order;
  packages: Package[];
}

export const fetchOrder = async (
  id: string,
  access_token: string,
): Promise<OrderDetails> => {
  console.log(id);
  const order = await fetchOrderByID(id);
  const packages = await fetchStaffPackages({ order_id: id }, access_token);
  console.log(packages);

  return { order: order, packages: packages.data };
};
