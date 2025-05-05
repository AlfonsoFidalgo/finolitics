"use server";

// import prisma from "@/db";

if (!process.env.DISQUS_API) {
  throw new Error("DISQUS_API_KEY is not defined");
}

export interface Finolier {
  id: string;
  displayName: string;
  avatar: string;
  about: string;
  location: string;
  numFollowers: number;
  numFollowing: number;
  numPosts: number;
}

interface FinolierFormState {
  errors: Record<string, string>;
  success: boolean;
  message: string;
  finolier: Finolier;
}

export async function fetchFinolierDetails(
  id: string
): Promise<FinolierFormState> {
  const url = `https://disqus.com/api/3.0/users/details?user=username%3A${id}&api_key=${process.env.DISQUS_API}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await res.json();
  
  return {
    errors: {},
    success: true,
    message: "Finolier details fetched successfully",
    finolier: {
      id,
      displayName: data.response.name,
      avatar: data.response.avatar?.permalink,
      about: data.response.about,
      location: data.response.location,
      numFollowers: data.response.numFollowers,
      numFollowing: data.response.numFollowing,
      numPosts: data.response.numPosts,
    },
  };
}
