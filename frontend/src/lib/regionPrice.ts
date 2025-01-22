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

export const calculatePrice = (
  packageDetails: PackageCalculate,
  pricingOptions: PricingOption[],
) => {
  const pricingOption = pricingOptions.find(
    (option) => option.id === packageDetails.pricingId,
  );

  if (!pricingOption) return 0;

  let price = pricingOption.base_rate;

  // Calculate volume
  const volume =
    packageDetails.width * packageDetails.length * packageDetails.height;

  // Add oversize fee if volume > 1000 cm³ (arbitrary threshold)
  if (volume > 1000) {
    price += pricingOption.oversize_rate;
  }

  // Add overweight fee
  if (packageDetails.weight > pricingOption.base_weight) {
    price +=
      (packageDetails.weight - pricingOption.base_weight) *
      pricingOption.overweight_rate_per_kg;
  }

  // Add fragile fee
  if (packageDetails.isFragile) {
    price += pricingOption.fragile_rate;
  }

  // Add urgent fee
  if (packageDetails.isUrgent) {
    price += pricingOption.urgent_rate;
  }

  return price;
};
