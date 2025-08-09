import type { Request, Response } from "express";
import { find, findWithPagination } from "@/utils/mongoDB";
import ENV from "@/ENV.dev";

export const getNoticeList = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const pageSize = parseInt((req.query.pageSize as string) || "5");

    if (isNaN(page)) {
      res.json({
        code: 400,
        msg: "Invalid page number",
      });
      return;
    }

    const result = await findWithPagination(ENV.DB.collectionName.notice, {
      page,
      pageSize,
      project: {
        _id: 0,
        content: 0,
      },
    });

    res.json({
      code: 200,
      msg: "Success",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: 500,
      msg: "Server error",
    });
  }
};

export const getNoticeDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await find(ENV.DB.collectionName.notice, {
      filter: {
        id,
      },
      project: {
        _id: 0,
      },
    });

    res.json({
      code: 200,
      msg: "Success",
      data: result[0],
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: 500,
      msg: "Server error",
    });
  }
};
