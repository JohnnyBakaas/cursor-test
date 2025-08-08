"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, AlertTriangle, FileText, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard-nav";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);

  // Get current user from database
  const dbUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });

  // Get user's buildings
  const userBuildings = useQuery(
    api.buildings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Get deviations for user's buildings
  const deviations = useQuery(api.deviations.list);

  useEffect(() => {
    if (dbUser) {
      setCurrentUser(dbUser);
    }
  }, [dbUser]);

  // Filter deviations for user's buildings
  const userDeviations =
    deviations?.filter((deviation) =>
      userBuildings?.some((building) => building?._id === deviation.buildingId)
    ) || [];

  const openDeviations = userDeviations.filter((d) => d.status === "open");
  const criticalDeviations = userDeviations.filter(
    (d) => d.priority === "critical"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.firstName || user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s an overview of your building management system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userBuildings?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Under your management
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Deviations
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openDeviations.length}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {criticalDeviations.length}
              </div>
              <p className="text-xs text-muted-foreground">High priority</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Substances</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">In catalog</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/deviations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Report New Deviation
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/buildings">
                  <Building className="mr-2 h-4 w-4" />
                  View Buildings
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/substances">
                  <FileText className="mr-2 h-4 w-4" />
                  Substance Catalog
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userDeviations.slice(0, 3).map((deviation) => (
                  <div
                    key={deviation._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{deviation.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(deviation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/deviations/${deviation._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {userDeviations.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buildings Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Buildings</CardTitle>
            <CardDescription>Buildings under your management</CardDescription>
          </CardHeader>
          <CardContent>
            {userBuildings && userBuildings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBuildings.map((building) => (
                  <div
                    key={building._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{building.name}</h3>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/buildings/${building._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    {building.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {building.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(building.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No buildings assigned yet</p>
                <Button asChild className="mt-4">
                  <Link href="/buildings">View All Buildings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
