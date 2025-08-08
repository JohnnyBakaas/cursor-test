import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    files: v.optional(v.array(v.string())),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const substanceId = await ctx.db.insert("substances", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return substanceId;
  },
});

export const get = query({
  args: { id: v.id("substances") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("substances").collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("substances")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("substances"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    files: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("substances") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Building substance associations
export const addToBuilding = mutation({
  args: {
    buildingId: v.id("buildings"),
    substanceId: v.id("substances"),
    isForAllBuildings: v.boolean(),
    addedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("buildingSubstances", {
      ...args,
      addedAt: now,
    });
  },
});

export const removeFromBuilding = mutation({
  args: {
    buildingId: v.id("buildings"),
    substanceId: v.id("substances"),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db
      .query("buildingSubstances")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .filter((q) => q.eq(q.field("substanceId"), args.substanceId))
      .first();

    if (association) {
      await ctx.db.delete(association._id);
    }
  },
});

export const getBuildingSubstances = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    // Get substances specific to this building
    const buildingSubstances = await ctx.db
      .query("buildingSubstances")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .collect();

    // Get substances for all buildings
    const allBuildingSubstances = await ctx.db
      .query("buildingSubstances")
      .withIndex("by_all_buildings", (q) => q.eq("isForAllBuildings", true))
      .collect();

    // Combine and get substance details
    const allSubstanceIds = [
      ...buildingSubstances.map((bs) => bs.substanceId),
      ...allBuildingSubstances.map((bs) => bs.substanceId),
    ];

    const substances = await Promise.all(
      allSubstanceIds.map((id) => ctx.db.get(id))
    );

    return substances.filter((s) => s !== null);
  },
});
