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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building, Plus, Edit, Trash2, Eye } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function BuildingsPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] =
    useState<Doc<"buildings"> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  // Get current user from database
  const dbUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });

  // Get all buildings (admin) or user's buildings
  const allBuildings = useQuery(api.buildings.list);
  const userBuildings = useQuery(
    api.buildings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Mutations
  const createBuilding = useMutation(api.buildings.create);
  const updateBuilding = useMutation(api.buildings.update);
  const deleteBuilding = useMutation(api.buildings.remove);

  useEffect(() => {
    if (dbUser) {
      setCurrentUser(dbUser);
    }
  }, [dbUser]);

  // Determine which buildings to show based on user role
  const buildings =
    currentUser?.role === "companyAdministrator" ? allBuildings : userBuildings;

  const handleCreateBuilding = async () => {
    if (!formData.name.trim() || !currentUser) {
      toast.error("Building name is required");
      return;
    }

    try {
      await createBuilding({
        name: formData.name,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        createdBy: currentUser._id,
      });

      toast.success("Building created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", imageUrl: "" });
    } catch {
      toast.error("Failed to create building");
    }
  };

  const handleUpdateBuilding = async () => {
    if (!editingBuilding || !formData.name.trim()) {
      toast.error("Building name is required");
      return;
    }

    try {
      await updateBuilding({
        id: editingBuilding._id,
        name: formData.name,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      toast.success("Building updated successfully");
      setIsEditDialogOpen(false);
      setEditingBuilding(null);
      setFormData({ name: "", description: "", imageUrl: "" });
    } catch {
      toast.error("Failed to update building");
    }
  };

  const handleDeleteBuilding = async (buildingId: Id<"buildings">) => {
    if (confirm("Are you sure you want to delete this building?")) {
      try {
        await deleteBuilding({ id: buildingId });
        toast.success("Building deleted successfully");
      } catch {
        toast.error("Failed to delete building");
      }
    }
  };

  const openEditDialog = (building: Doc<"buildings">) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      description: building.description || "",
      imageUrl: building.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buildings</h1>
            <p className="text-gray-600 mt-2">
              Manage your building portfolio and access controls.
            </p>
          </div>
          {currentUser?.role === "companyAdministrator" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Building
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Building</DialogTitle>
                  <DialogDescription>
                    Create a new building in your portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Building Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter building name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter building description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBuilding}>
                      Create Building
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Buildings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings?.map((building) => (
            <Card
              key={building._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>{building.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/buildings/${building._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {currentUser?.role === "companyAdministrator" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(building)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBuilding(building._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {building.description && (
                  <CardDescription>{building.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {building.imageUrl && (
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      {/* next/image is recommended; skipping for brevity */}
                      <img
                        src={building.imageUrl}
                        alt={building.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Created {new Date(building.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {buildings?.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No buildings found
            </h3>
            <p className="text-gray-500">
              {currentUser?.role === "companyAdministrator"
                ? "Get started by adding your first building."
                : "No buildings have been assigned to you yet."}
            </p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Building</DialogTitle>
              <DialogDescription>
                Update building information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Building Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter building name"
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
                  placeholder="Enter building description"
                />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateBuilding}>Update Building</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
