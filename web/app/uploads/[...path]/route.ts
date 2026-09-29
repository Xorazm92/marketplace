import { forward } from "@/lib/proxy";

export async function GET(request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  return forward(request, "/uploads", (await ctx.params).path);
}
