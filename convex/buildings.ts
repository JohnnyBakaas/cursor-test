import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const buildingId = await ctx.db.insert("buildings", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return buildingId;
  },
});

export const get = query({
  args: { id: v.id("buildings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("buildings").collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get buildings the user has access to
    const access = await ctx.db
      .query("buildingAccess")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const buildingIds = access.map((a) => a.buildingId);
    const buildings = await Promise.all(
      buildingIds.map((id) => ctx.db.get(id))
    );

    return buildings.filter((b) => b !== null);
  },
});

export const update = mutation({
  args: {
    id: v.id("buildings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
  args: { id: v.id("buildings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Building access management
export const grantAccess = mutation({
  args: {
    userId: v.id("users"),
    buildingId: v.id("buildings"),
    grantedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("buildingAccess", {
      ...args,
      grantedAt: now,
    });
  },
});

export const revokeAccess = mutation({
  args: {
    userId: v.id("users"),
    buildingId: v.id("buildings"),
  },
  handler: async (ctx, args) => {
    const access = await ctx.db
      .query("buildingAccess")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("buildingId"), args.buildingId))
      .first();

    if (access) {
      await ctx.db.delete(access._id);
    }
  },
});

export const getUserAccess = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("buildingAccess")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
