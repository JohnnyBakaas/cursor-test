import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    buildingId: v.id("buildings"),
    createdBy: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const deviationId = await ctx.db.insert("deviations", {
      ...args,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    return deviationId;
  },
});

export const get = query({
  args: { id: v.id("deviations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("deviations").collect();
  },
});

export const listByBuilding = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deviations")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deviations")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deviations")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("deviations"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("closed")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
    images: v.optional(v.array(v.string())),
    resolvedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, resolvedBy, ...updates } = args;
    const now = Date.now();

    const updateData: any = {
      ...updates,
      updatedAt: now,
    };

    // If status is being set to resolved, set resolvedAt
    if (updates.status === "resolved" && resolvedBy) {
      updateData.resolvedAt = now;
      updateData.resolvedBy = resolvedBy;
    }

    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("deviations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
