export interface FetchPackage {
  limit: number;
  offset: number;
  name: string;
  order_id: string | null;
  status: string;
  is_urgent: boolean;
  is_fragile: boolean;
}

interface BasePackage {
  address_id: string;
  description: string;
  merchant_id: string;
  is_fragile: boolean;
  is_urgent: boolean;
  street: string;
  name: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  phone: string;
  package_rate_id: string;
  cod_cost: number;
}

export interface Package extends BasePackage {
  //merchant_id: string;
  id: string;
  shipping_cost: number;
  // cod_cost: number;
  order_id: string;
  block_id: string | null;
  status: string;
  order_date: string;
}

export interface PackageCreate extends BasePackage {}

export interface PackageHistory {
  id: string;
  package_id: string;
  staff_id: string;
  action: string;
  notes: string;
  timestamp: string;
}
