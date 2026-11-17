// Phiên đăng nhập: lưu trong cookie đã ký bằng khoá bí mật SESSION_SECRET (theo hướng dẫn chính thức Next.js 16).
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { RoleName } from "./roles";

export const SESSION_COOKIE = "dh_session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  role: RoleName;
  mustChangePassword: boolean;
};

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Thiếu SESSION_SECRET (ít nhất 32 ký tự) trong file .env");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null; // cookie hỏng hoặc hết hạn
  }
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  (await cookies()).set(SESSION_COOKIE, await encrypt(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
