import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("occupant"),
      v.literal("buildingWorker"),
      v.literal("companyAdministrator")
    ),
    phoneNumber: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  buildings: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_by", ["createdBy"]),

  buildingAccess: defineTable({
    userId: v.id("users"),
    buildingId: v.id("buildings"),
    grantedAt: v.number(),
    grantedBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_building", ["buildingId"]),

  deviations: defineTable({
    title: v.string(),
    description: v.string(),
    buildingId: v.id("buildings"),
    createdBy: v.id("users"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    images: v.optional(v.array(v.string())),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_building", ["buildingId"])
    .index("by_created_by", ["createdBy"])
    .index("by_status", ["status"]),

  substances: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    files: v.optional(v.array(v.string())),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_by", ["createdBy"]),

  buildingSubstances: defineTable({
    buildingId: v.id("buildings"),
    substanceId: v.id("substances"),
    isForAllBuildings: v.boolean(),
    addedBy: v.id("users"),
    addedAt: v.number(),
  })
    .index("by_building", ["buildingId"])
    .index("by_substance", ["substanceId"])
    .index("by_all_buildings", ["isForAllBuildings"]),

  fireInspections: defineTable({
    buildingId: v.id("buildings"),
    inspectorId: v.id("users"),
    inspectionDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    notes: v.optional(v.string()),
    findings: v.optional(
      v.array(
        v.object({
          category: v.string(),
          description: v.string(),
          severity: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          actionRequired: v.boolean(),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_building", ["buildingId"])
    .index("by_inspector", ["inspectorId"])
    .index("by_status", ["status"]),

  maintenanceSchedule: defineTable({
    buildingId: v.id("buildings"),
    title: v.string(),
    description: v.optional(v.string()),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
    nextDueDate: v.number(),
    assignedTo: v.optional(v.id("users")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_building", ["buildingId"])
    .index("by_next_due", ["nextDueDate"])
    .index("by_assigned", ["assignedTo"]),
});
