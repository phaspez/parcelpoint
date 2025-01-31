import { Account } from "@/types/account";
import { Merchant } from "@/app/dashboard/staff/packages/data";
import axios from "axios";

type PartialUser = Partial<Account> | Partial<Merchant>;

export async function patchMerchantAccount(
  id: string,
  token: string,
  user: PartialUser,
) {
  try {
    console.log(user);

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

    // const accountPromise = await fetch(
    //   process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/account/${id}`,
    //   {
    //     method: "PATCH",
    //     headers: {
    //       "Content-Type": "application/www-form-urlencoded",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify(user),
    //   },
    // );

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

    console.log(accountPromise);
    console.log(merchantPromise);

    if (!accountPromise || !merchantPromise.ok) {
      throw new Error("Failed to update user");
    }

    // return response_account.json();
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}
