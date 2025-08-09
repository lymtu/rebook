import type { Request, Response } from "express";
import { find } from "@/utils/mongoDB";
import ENV from "@/ENV.dev";

import { decryptToPassword } from "@/utils/crypto";

export const adminAuth = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const token = req.signedCookies.token;

  if (!token) {
    res.json({
      code: 401,
      msg: "token is not exist",
    });
    return;
  }

  const { adminName, root, type, iss, iat, exp } = JSON.parse(token);

  if (
    [adminName, type, iss, iat, exp, root].some((item) => item === void 0) ||
    iss !== ENV.BASE_URL ||
    type !== "admin"
  ) {
    res.json({
      code: 401,
      msg: "token is not valid",
    });
    return;
  }

  if (exp < Date.now()) {
    res.cookie("token", createAdminToken({ adminName, root }), {
      httpOnly: true,
      secure: ENV.COOKIE.SECURE.admin,
      sameSite: "lax",
      domain: ENV.COOKIE.DOMAIN.admin,
      path: "/",
      signed: true,
    });

    res.clearCookie("token")

    res.json({
      code: 401,
      msg: "token is expired, signin again",
    });
    return;
  }

  if (req.method === "GET" && root.includes("admin:view")) {
    next();
    return;
  }

  if (req.method === "POST" && root.includes("admin:edit")) {
    next();
    return;
  }

  if (req.method === "PUT" && root.includes("admin:edit")) {
    next();
    return;
  }

  if (req.method === "DELETE" && root.includes("admin:delete")) {
    next();
    return;
  }

  res.json({
    code: 401,
    msg: "permission denied",
  });
};

export const adminSignIn = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.json({
        code: 401,
        msg: "username or password is required",
      });
      return;
    }

    const result = await find("admin", {
      filter: { name: username },
      project: {
        _id: 0,
      },
    });

    if (result.length !== 1) {
      res.json({
        code: 400,
        msg: "username is incorrect",
      });
      return;
    }

    const decryptedPassword = decryptToPassword(password);

    // if (result[0].password !== hashEncrypt(decryptedPassword, ENV.PWD_SALT)) {
    if (result[0].password !== decryptedPassword) {
      res.json({
        code: 400,
        msg: "password is incorrect",
      });
      return;
    }

    res.cookie(
      "token",
      createAdminToken({ adminName: result[0].name, root: result[0].root }),
      {
        httpOnly: true,
        secure: ENV.COOKIE.SECURE.admin,
        sameSite: "lax",
        domain: ENV.COOKIE.DOMAIN.admin,
        path: "/",
        signed: true,
      }
    );

    res.json({
      code: 200,
      msg: "success",
      data: {
        username: result[0].name,
        root: result[0].root,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

function createAdminToken(info: { adminName: string; root: string[] }) {
  const iat = Date.now();
  return JSON.stringify({
    ...info,
    type: "admin",
    iss: ENV.BASE_URL,
    iat,
    exp: iat + ENV.COOKIE.EXPIRES.admin, // 30 minutes
  });
}
