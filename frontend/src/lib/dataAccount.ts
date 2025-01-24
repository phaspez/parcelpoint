"use server";

import { cookies } from "next/headers";
import { Account } from "@/types/account";
import { redirect } from "next/navigation";

export default async function fetchPersonalInfo() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/");
  }
  
  const response = await fetch(process.env.BACKEND_URL + "/api/v1/account/me", {
    method: "get",
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  if (!response.json) {
    throw new Error("No data received");
  }

  return (await response.json()) as Account;
}
