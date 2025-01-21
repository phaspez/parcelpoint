import axios from "axios";

export async function fetchPackageDaysAgo(
  daysAgo: number = 20,
  access_token: string,
) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/v1/merchant/dashboard/package_per_day?days_ago=${daysAgo}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
