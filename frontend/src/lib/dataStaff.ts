"use server";

import { cookies } from "next/headers";
import { Account } from "@/types/account";
import { redirect } from "next/navigation";

function get_python_datetime(date: Date) {
  // Python's datetime format: YYYY-MM-DD HH:MM:SS.ffffff
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0") +
    "." +
    String(date.getMilliseconds() * 1000).padStart(6, "0")
  );
}

export default async function fetchStaffDashboard(start: Date, end: Date) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/");
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL +
      `/api/v1/staff/dashboard/overview?start_date=${get_python_datetime(start)}&end_date=${get_python_datetime(end)}`,
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
