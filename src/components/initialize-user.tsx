"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function InitializeUser() {
  const hasRunRef = useRef(false);
  const { user, isSignedIn } = useUser();
  const dbUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const createUser = useMutation(api.users.create);

  useEffect(() => {
    if (!isSignedIn || hasRunRef.current === true) return;
    if (user && dbUser === null) {
      hasRunRef.current = true;
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: "occupant",
        phoneNumber: user.primaryPhoneNumber?.phoneNumber,
      }).catch(() => {
        hasRunRef.current = false;
      });
    }
  }, [user, isSignedIn, dbUser, createUser]);

  return null;
}
