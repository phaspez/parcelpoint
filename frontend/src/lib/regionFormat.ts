import { PricingOption } from "@/types/pricingOptions";

export const VNDong = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export interface PackageCalculate {
  width: number;
  length: number;
  height: number;
  weight: number;
  isFragile: boolean;
  isUrgent: boolean;
  pricingId: string;
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
