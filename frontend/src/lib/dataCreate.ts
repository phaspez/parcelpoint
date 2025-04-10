"use server";

import { PackageCreate } from "@/types/packages";
import { cookies } from "next/headers";

export async function fetchCreatePackage(packageData: PackageCreate) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) throw Error("You need to log in to perform this action");
  const accessToken = token.value;

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/package/my_packages",
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...packageData, merchant_id: null }),
      },
    );

    const data = await response.json();
    console.log(data);

    if (response.status == 422) {
      throw new Error("Unprocessable entity");
    }

    return data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export async function fetchBulkCreatePackage(file: File) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) throw Error("You need to log in to perform this action");
  const accessToken = token.value;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/package/my_packages/bulk",
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

    const data = await response.json();
    console.log(data);

    if (response.status == 422) {
      throw new Error("Unprocessable entity");
    }

    return data;
  } catch (error) {
    console.error("Error uploading bulk packages:", error);
    throw error;
  }
}
