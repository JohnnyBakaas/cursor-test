"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SubstancesPage() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);

  // Queries
  const dbUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const substances = useQuery(api.substances.list);
  const buildings = useQuery(api.buildings.list);

  // Mutations
  const createSubstance = useMutation(api.substances.create);
  const updateSubstance = useMutation(api.substances.update);
  const deleteSubstance = useMutation(api.substances.remove);
  const addToBuilding = useMutation(api.substances.addToBuilding);
  const removeFromBuilding = useMutation(api.substances.removeFromBuilding);

  useEffect(() => {
    if (dbUser) setCurrentUser(dbUser);
  }, [dbUser]);

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  const handleCreate = async () => {
    if (!createForm.name.trim() || !currentUser)
      return toast.error("Name is required");
    try {
      await createSubstance({
        name: createForm.name,
        description: createForm.description || undefined,
        createdBy: currentUser._id,
      });
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "" });
      toast.success("Substance created");
    } catch {
      toast.error("Failed to create");
    }
  };

  // Assign to building
  const [assignBuildingId, setAssignBuildingId] = useState<string>("");
  const [assignAllBuildings, setAssignAllBuildings] = useState<boolean>(false);

  const handleAssign = async (substanceId: Id<"substances">) => {
    try {
      await addToBuilding({
        buildingId: assignAllBuildings
          ? (buildings?.[0]?._id as Id<"buildings">)
          : (assignBuildingId as Id<"buildings">),
        substanceId,
        isForAllBuildings: assignAllBuildings,
        addedBy: currentUser!._id,
      });
      toast.success("Assigned");
      setAssignBuildingId("");
      setAssignAllBuildings(false);
    } catch {
      toast.error("Failed to assign");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Substance Catalog
            </h1>
            <p className="text-gray-600 mt-2">
              Manage materials and safety documentation.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Substance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Substance</DialogTitle>
                <DialogDescription>
                  Create a new substance entry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {substances?.map((s) => (
            <Card key={s._id}>
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
                {s.description && (
                  <CardDescription>{s.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={assignBuildingId}
                    onValueChange={setAssignBuildingId}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={assignAllBuildings ? "default" : "outline"}
                    onClick={() => setAssignAllBuildings((v) => !v)}
                  >
                    All Buildings
                  </Button>
                  <Button onClick={() => handleAssign(s._id)}>Assign</Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => deleteSubstance({ id: s._id })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
