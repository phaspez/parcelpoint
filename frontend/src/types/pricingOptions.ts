export interface PricingOption {
  id: string;
  name: string;
  base_rate: number;
  base_weight: number;
  oversize_rate: number;
  overweight_rate_per_kg: number;
  fragile_rate: number;
  urgent_rate: number;
}
