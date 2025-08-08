"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function DeviationsPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDeviation, setEditingDeviation] =
    useState<Doc<"deviations"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buildingId: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    images: [] as string[],
  });

  // Get current user from database
  const dbUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });

  // Get data
  const allDeviations = useQuery(api.deviations.list);
  const allBuildings = useQuery(api.buildings.list);
  const userBuildings = useQuery(
    api.buildings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Mutations
  const createDeviation = useMutation(api.deviations.create);
  const updateDeviation = useMutation(api.deviations.update);
  const deleteDeviation = useMutation(api.deviations.remove);

  useEffect(() => {
    if (dbUser) {
      setCurrentUser(dbUser);
    }
  }, [dbUser]);

  // Filter deviations based on user role and filters
  const filteredDeviations =
    allDeviations?.filter((deviation) => {
      // Filter by user access
      const hasAccess =
        currentUser?.role === "companyAdministrator" ||
        userBuildings?.some(
          (building) => building?._id === deviation.buildingId
        );

      if (!hasAccess) return false;

      // Filter by search term
      if (
        searchTerm &&
        !deviation.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && deviation.status !== statusFilter) {
        return false;
      }

      // Filter by priority
      if (priorityFilter !== "all" && deviation.priority !== priorityFilter) {
        return false;
      }

      return true;
    }) || [];

  const handleCreateDeviation = async () => {
    if (!formData.title.trim() || !formData.buildingId || !currentUser) {
      toast.error("Title and building are required");
      return;
    }

    try {
      await createDeviation({
        title: formData.title,
        description: formData.description,
        buildingId: formData.buildingId as Id<"buildings">,
        priority: formData.priority,
        createdBy: currentUser._id,
        images: formData.images.length > 0 ? formData.images : undefined,
      });

      toast.success("Deviation created successfully");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        buildingId: "",
        priority: "medium",
        images: [],
      });
    } catch {
      toast.error("Failed to create deviation");
    }
  };

  const handleUpdateDeviation = async () => {
    if (!editingDeviation || !formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await updateDeviation({
        id: editingDeviation._id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        images: formData.images.length > 0 ? formData.images : undefined,
      });

      toast.success("Deviation updated successfully");
      setIsEditDialogOpen(false);
      setEditingDeviation(null);
      setFormData({
        title: "",
        description: "",
        buildingId: "",
        priority: "medium",
        images: [],
      });
    } catch {
      toast.error("Failed to update deviation");
    }
  };

  const handleDeleteDeviation = async (deviationId: Id<"deviations">) => {
    if (confirm("Are you sure you want to delete this deviation?")) {
      try {
        await deleteDeviation({ id: deviationId });
        toast.success("Deviation deleted successfully");
      } catch {
        toast.error("Failed to delete deviation");
      }
    }
  };

  const openEditDialog = (deviation: Doc<"deviations">) => {
    setEditingDeviation(deviation);
    setFormData({
      title: deviation.title,
      description: deviation.description,
      buildingId: deviation.buildingId as unknown as string,
      priority: deviation.priority,
      images: deviation.images || [],
    });
    setIsEditDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBuildingName = (buildingId: string) => {
    return (
      allBuildings?.find(
        (b) => b._id === (buildingId as unknown as Id<"buildings">)
      )?.name || "Unknown Building"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deviations</h1>
            <p className="text-gray-600 mt-2">
              Track and manage building issues and deviations.
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Deviation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Deviation</DialogTitle>
                <DialogDescription>
                  Create a new deviation report for a building.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter deviation title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the deviation in detail"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Select
                    value={formData.buildingId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, buildingId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {userBuildings?.map((building) => (
                        <SelectItem key={building._id} value={building._id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(
                      value: "low" | "medium" | "high" | "critical"
                    ) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDeviation}>
                    Create Deviation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search deviations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: string) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value: string) => setPriorityFilter(value)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deviations List */}
        <div className="space-y-4">
          {filteredDeviations.map((deviation) => (
            <Card
              key={deviation._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-lg">
                        {deviation.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(deviation.priority)}>
                        {deviation.priority}
                      </Badge>
                      <Badge className={getStatusColor(deviation.status)}>
                        {deviation.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {getBuildingName(
                          deviation.buildingId as unknown as string
                        )}
                      </span>
                    </div>
                    <CardDescription className="mt-2">
                      {deviation.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/deviations/${deviation._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(deviation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDeviation(deviation._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Created {new Date(deviation.createdAt).toLocaleDateString()}
                  {deviation.resolvedAt && (
                    <span className="ml-4">
                      Resolved{" "}
                      {new Date(deviation.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDeviations.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deviations found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters."
                : "Get started by reporting your first deviation."}
            </p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Deviation</DialogTitle>
              <DialogDescription>
                Update deviation information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter deviation title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the deviation in detail"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(
                    value: "low" | "medium" | "high" | "critical"
                  ) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateDeviation}>
                  Update Deviation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
