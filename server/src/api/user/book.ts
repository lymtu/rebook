import type { Request, Response } from "express";
import type { Book } from "@/types/book";
import { find, findWithPagination } from "@/utils/mongoDB";

import ENV from "@/ENV.dev";

export async function recommendList(req: Request, res: Response) {
  try {
    const findResult = await findWithPagination(ENV.DB.collectionName.book, {
      filter: {
        status: true,
      },
      project: {
          _id: 0,
          author: 0,
          type: 0,
          status: 0,
          inputTime: 0,
          imgSrc: 0,
      },
      sort: {
        inputTime: -1,
      },
      pageSize: 3,
    });

    res.send({
      code: 200,
      data: findResult,
    });
  } catch (error) {
    res.send({
      code: 500,
      msg: error,
    });
  }
}
