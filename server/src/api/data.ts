import type { Request, Response } from "express";
import type { Book } from "@/types/book";
import { find, findWithPagination } from "@/utils/mongoDB";

import ENV from "@/ENV.dev";

export const onSaleList = async (req: Request, res: Response) => {
  try {
    const { page_ = "1", category } = req.query;
    const page = parseInt(page_ as string);
    if (isNaN(page)) {
      res.json({
        code: 400,
        msg: "Missing page",
      });
      return;
    }

    const filter = category === "6" ? {} : { category };

    const data = await findWithPagination(ENV.DB.collectionName.book, {
      project: {
        _id: 0,
        status: 0,
        imgSrc: 0,
      },
      sort: {
        inputTime: -1,
      },
      filter: {
        ...filter,
        category,
        status: true,
      },
      page,
      pageSize: ENV.DB.paginationSize.bookList,
    });

    res.json({
      code: 200,
      msg: "Success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "Server Error",
    });
  }
};

export const bookDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      res.json({
        code: 400,
        msg: "缺少参数！",
      });
      return;
    }

    const data: Book[] = await find(ENV.DB.collectionName.book, {
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
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "Server Error",
    });
  }
};
