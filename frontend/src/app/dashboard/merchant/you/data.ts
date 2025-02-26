import { Account } from "@/types/account";
import { Merchant } from "@/app/dashboard/staff/packages/data";
import axios from "axios";

type PartialUser = Partial<Account> | Partial<Merchant>;

export async function patchMerchantAccount(
  id: string,
  token: string,
  user: PartialUser,
) {
  const accountPromise = await axios.patch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/${id}`,
    JSON.stringify(user),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const merchantPromise = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/merchant/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchant_updated: user, account_updated: user }),
    },
  );

  if (!accountPromise || !merchantPromise.ok) {
    throw new Error("Failed to update user");
  }
}
