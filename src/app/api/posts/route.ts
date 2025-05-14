import { headers } from "next/headers";

import { fetchThreadDetails } from "@/actions/disqus";
import { fetchNonPrivateFinoliers } from "@/actions/utils";

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
}
