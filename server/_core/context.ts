import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "./auth";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookies } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const cookieHeader = opts.req.headers.cookie ?? "";
    const cookies = parseCookies(cookieHeader);
    const token = cookies[COOKIE_NAME];
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        user = await db.getUserById(payload.userId);
      }
    }
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
