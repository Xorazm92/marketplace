import { JwtAdminPayload } from "./admin-jwt-payload.type";

export type AdminJwtPayloadWithRefreshToken = JwtAdminPayload & {refreshToken: string};