import { v4 as uuidv4 } from "uuid";

export type PackageStatus =
  | "DELIVERED"
  | "ORDERED"
  | "DELIVERING"
  | "CANCELLED"
  | "MISSING";

export interface Package {
  merchant_id: string;
  phone: string;
  package_rate_id: string;
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  shipping_cost: number;
  cod_cost: number;
  order_id: string;
  block_id: string;
  address_id: string;
  description: string;
  is_fragile: boolean;
  is_urgent: boolean;
  name: string;
  status: PackageStatus;
}

export function generateFakePackages(count: number): Package[] {
  const statuses: PackageStatus[] = [
    "DELIVERED",
    "ORDERED",
    "DELIVERING",
    "CANCELLED",
    "MISSING",
  ];

  return Array.from({ length: count }, () => ({
    merchant_id: uuidv4(),
    phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    package_rate_id: uuidv4(),
    id: uuidv4(),
    width: Number((Math.random() * 50 + 1).toFixed(2)),
    height: Number((Math.random() * 50 + 1).toFixed(2)),
    length: Number((Math.random() * 50 + 1).toFixed(2)),
    weight: Number((Math.random() * 20 + 0.1).toFixed(2)),
    shipping_cost: Number((Math.random() * 100 + 5).toFixed(2)),
    cod_cost: Number((Math.random() * 50).toFixed(2)),
    order_id: uuidv4(),
    block_id: uuidv4(),
    address_id: uuidv4(),
    description: `Fake package description ${Math.floor(Math.random() * 1000)}`,
    is_fragile: Math.random() > 0.5,
    is_urgent: Math.random() > 0.7,
    name: `Package ${Math.floor(Math.random() * 1000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}
