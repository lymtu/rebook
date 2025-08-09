import type { Request, Response } from "express";
import { publicKey } from "@/utils/crypto";
export const getPublicKey = (_: Request, res: Response) => {
  try {
    res.json({
      code: 200,
      msg: "success",
      data: publicKey,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "Internal Server Error",
    });
  }
};
