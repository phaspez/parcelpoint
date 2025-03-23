import { StorageBlock } from "@/app/dashboard/staff/storage/data";

export interface ShipmentRate {
  id: string;
  name: string;
  base_rate: number;
  base_weight: number;
  oversize_rate: number;
  overweight_rate_per_kg: number;
  fragile_rate: number;
  urgent_rate: number;
}

export interface CreateShipmentRate {
  name: string;
  base_rate: number;
  base_weight: number;
  oversize_rate: number;
  overweight_rate_per_kg: number;
  fragile_rate: number;
  urgent_rate: number;
}

export async function fetchShipmentRates() {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/package_rate",
    {
      method: "get",
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as ShipmentRate[];
}

export async function patchShipmentRate(
  id: string,
  data: Partial<ShipmentRate>,
) {
  console.log(JSON.stringify(data));
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package_rate/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function postShipmentRate(data: CreateShipmentRate) {
  console.log(JSON.stringify(data));
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/package_rate/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
