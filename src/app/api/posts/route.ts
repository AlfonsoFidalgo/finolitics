import { headers } from "next/headers";
import prisma from "@/db";

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

  const url = `https://disqus.com/api/3.0/threads/details?thread=10538477384&api_key=${process.env.DISQUS_API}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const data = await res.json();

  const threadPayload = {
    id: data.response.id,
    title: data.response.clean_title,
    link: data.response.link,
  };

  try {
    await prisma.threads.create({
      data: threadPayload,
    });
    return new Response(JSON.stringify({ message: "All good" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
