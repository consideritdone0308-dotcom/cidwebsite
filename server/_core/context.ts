import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "./auth";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookies } from "cookie";
import type * as express from "express";

export type TrpcContext = {
  req: express.Request;
  res: express.Response;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const req = opts.req as express.Request;
    const cookieHeader = (req.headers?.cookie as string) ?? "";
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
  return { req: opts.req as express.Request, res: opts.res as express.Response, user };
}
