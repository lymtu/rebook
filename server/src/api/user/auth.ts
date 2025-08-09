import type { Request, Response } from "express";
import ENV from "@/ENV.dev";
import { find, insert } from "@/utils/mongoDB";
import { hashEncrypt } from "@/utils/crypto";

const maxAge = ENV.COOKIE.EXPIRES.user;

const regex = new RegExp(
  /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
);

export const userAuth = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const token = req.signedCookies.token;

  if (!token) {
    res.json({
      code: 400,
      msg: "token is not exist",
    });
    return;
  }

  const { email, name, type, iss, iat, exp } = JSON.parse(token);

  if (!email || !name || !type || !iss || !iat || !exp) {
    res.json({
      code: 401,
      msg: "token is not valid",
    });
    return;
  }

  if (iss !== ENV.BASE_URL || type !== "user") {
    res.json({
      code: 401,
      msg: "token is not valid",
    });
    return;
  }

  if (exp < Date.now()) {
    res.json({
      code: 401,
      msg: "token is expired",
    });
    return;
  }

  req.headers["x-user-email"] = email;

  next();
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.json({
        code: 400,
        msg: "用户信息不全！",
      });
      return;
    }

    if (!regex.test(email)) {
      res.json({
        code: 400,
        msg: "邮箱格式不正确！",
      });
      return;
    }

    const findResult = await find("user", {
      filter: {
        email,
      },
      project: {
        _id: 0,
      },
    });

    if (findResult.length > 0) {
      res.json({
        code: 400,
        msg: "该邮箱已被注册！",
      });
      return;
    }

    await insert("user", {
      name,
      email,
      password: hashEncrypt(password, ENV.PWD_SALT),
    });

    res.cookie("token", createUserToken(name, email, maxAge), {
      maxAge,
      httpOnly: true,
      secure: ENV.COOKIE.SECURE.user,
      sameSite: "none",
      signed: true,
    });

    res.json({
      code: 200,
      msg: "注册成功",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes("@") || !password) {
      res.json({
        code: 400,
        msg: "用户信息不全！",
      });
      return;
    }

    const findResult = await find("user", {
      filter: {
        email,
      },
      project: {
        _id: 0,
      },
    });

    if (findResult.length === 0) {
      res.json({
        code: 400,
        msg: "邮箱未注册！",
      });
      return;
    }

    if (findResult[0].password !== hashEncrypt(password, ENV.PWD_SALT)) {
      res.json({
        code: 400,
        msg: "密码错误！",
      });
      return;
    }

    const name = findResult[0].name;
    res.cookie("token", createUserToken(name, email, maxAge), {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7天
      httpOnly: true,
      secure: ENV.COOKIE.SECURE.user,
      sameSite: "none",
      signed: true,
    });

    res.json({
      code: 200,
      msg: "登录成功",
      data: {
        name,
        email,
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

export const signout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.json({
      code: 200,
      msg: "",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

function createUserToken(name: string, email: string, maxAge: number) {
  const iat = Date.now();
  return JSON.stringify({
    email,
    name,
    type: "user",
    iss: ENV.BASE_URL,
    iat,
    exp: iat + maxAge,
  });
}
