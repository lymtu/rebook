import type { Request, Response } from "express";
import { deleteData, find, insert, updateOne } from "@/utils/mongoDB";

export const addNotice = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    const time = Date.now();

    await insert("notice", {
      id: time.toString(),
      title,
      content,
      time,
    });

    res.json({
      code: 200,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const modifyNotice = async (req: Request, res: Response) => {
  try {
    const { id, title, content } = req.body;

    if (!id || !title || !content) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    const result = await updateOne(
      "notice",
      { id },
      {
        $set: {
          title,
          content,
          changeTime: Date.now(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      res.json({
        code: 400,
        msg: "no such notice",
      });
      return;
    }

    res.json({
      code: 200,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    await deleteData("notice", { id });

    res.json({
      code: 200,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};
