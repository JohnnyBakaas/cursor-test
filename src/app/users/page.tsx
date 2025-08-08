"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const dbUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const users = useQuery(api.users.list);
  const updateUser = useMutation(api.users.update);

  useEffect(() => {
    if (dbUser) setCurrentUser(dbUser);
  }, [dbUser]);

  const canAdmin = currentUser?.role === "companyAdministrator";

  const handleRoleChange = async (
    id: Id<"users">,
    role: Doc<"users">["role"]
  ) => {
    if (!canAdmin) return;
    try {
      await updateUser({ id, role });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users?.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <div className="font-medium">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={u.role}
                    onValueChange={(val) =>
                      handleRoleChange(u._id, val as Doc<"users">["role"])
                    }
                    disabled={!canAdmin}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="occupant">Occupant</SelectItem>
                      <SelectItem value="buildingWorker">
                        Building Worker
                      </SelectItem>
                      <SelectItem value="companyAdministrator">
                        Company Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
