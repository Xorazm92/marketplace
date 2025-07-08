import { JwtPayload } from "./jwt-payload.type";

export type JwtPayloadWithRefreshToken = JwtPayload & {refreshToken: string};