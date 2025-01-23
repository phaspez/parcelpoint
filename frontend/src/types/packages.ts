export interface FetchPackage {
  limit: number;
  offset: number;
  name: string;
  order_id: string | null;
  status: string;
  is_urgency: boolean;
  is_fragile: boolean;
}

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
  block_id: string | null;
  address_id: string;
  description: string;
  is_fragile: boolean;
  is_urgent: boolean;
  street: string;
  name: string;
  status: string;
  order_date: string;
}

export interface PackageHistory {
  id: string;
  package_id: string;
  merchant_id: string;
  action: string;
  notes: string;
  timestamp: string;
}
