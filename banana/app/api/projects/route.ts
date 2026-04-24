import { NextResponse } from "next/server"

/**
 * GET /api/projects
 *
 * Returns a mock list of projects for the project library page.
 *
 * TODO: To integrate with a real backend, replace the mockData array below
 * with a database query (e.g., Prisma, Supabase, or an external API call).
 * Example:
 *   const projects = await db.project.findMany({ orderBy: { updatedAt: "desc" } })
 *   return NextResponse.json({ data: projects })
 *
 * Expected shape per project:
 *   { id: string, name: string, thumbnail: string, updatedAt: string (ISO 8601) }
 */

const mockData = [
  {
    id: "proj-001",
    name: "城市日落系列",
    thumbnail: "https://picsum.photos/seed/sunset-city/480/360",
    updatedAt: "2026-04-23T10:30:00.000Z",
  },
  {
    id: "proj-002",
    name: "赛博朋克角色设计",
    thumbnail: "https://picsum.photos/seed/cyberpunk-char/480/360",
    updatedAt: "2026-04-22T15:45:00.000Z",
  },
  {
    id: "proj-003",
    name: "水彩花卉插画",
    thumbnail: "https://picsum.photos/seed/watercolor-flower/480/360",
    updatedAt: "2026-04-21T09:12:00.000Z",
  },
  {
    id: "proj-004",
    name: "未来建筑概念图",
    thumbnail: "https://picsum.photos/seed/future-arch/480/360",
    updatedAt: "2026-04-20T18:20:00.000Z",
  },
  {
    id: "proj-005",
    name: "美食摄影后期",
    thumbnail: "https://picsum.photos/seed/food-photo/480/360",
    updatedAt: "2026-04-19T14:00:00.000Z",
  },
  {
    id: "proj-006",
    name: "抽象几何艺术",
    thumbnail: "https://picsum.photos/seed/abstract-geo/480/360",
    updatedAt: "2026-04-18T11:30:00.000Z",
  },
  {
    id: "proj-007",
    name: "国风水墨山水",
    thumbnail: "https://picsum.photos/seed/ink-landscape/480/360",
    updatedAt: "2026-04-17T08:45:00.000Z",
  },
  {
    id: "proj-008",
    name: "产品渲染展示",
    thumbnail: "https://picsum.photos/seed/product-render/480/360",
    updatedAt: "2026-04-16T20:10:00.000Z",
  },
]

export async function GET() {
  // Simulate a small network delay for realistic loading state
  await new Promise((r) => setTimeout(r, 300))

  return NextResponse.json({ data: mockData })
}
