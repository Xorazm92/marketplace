import { forward } from "@/lib/proxy";

type Ctx = RouteContext<"/api/[...path]">;
const handle = async (request: Request, ctx: Ctx) => forward(request, "/api", (await ctx.params).path);

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
