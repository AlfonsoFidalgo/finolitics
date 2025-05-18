import { headers } from "next/headers";

import { fetchNonPrivateFinoliers, updateFinoliersPosts } from "@/actions";

export async function GET() {
  const headersList = await headers();
  if (
    headersList.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const finolierList = await fetchNonPrivateFinoliers();
  if (finolierList.length === 0) {
    return new Response(JSON.stringify({ error: "No finoliers found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const finolierIds = finolierList.map((finolier) => finolier.id);
  const res = await updateFinoliersPosts(finolierIds);
  if (!res || !res.success) {
    return new Response(JSON.stringify({ error: "Error updating posts" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Finolier posts and threads updated successfully",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
