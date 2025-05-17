"use server";

import prisma from "@/db";

export async function saveUser(userId: string): Promise<{
  success: boolean;
}> {
  try {
    await prisma.users.create({
      data: {
        id: userId,
      },
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error saving user:", error);
    return {
      success: false,
    };
  }
}

export async function isUserInDB(userId: string): Promise<boolean> {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      return true;
    }
    return false;
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    return false;
  }
}
