import type { Request, Response } from "express";

import { find, findWithPagination, updateOne } from "@/utils/mongoDB";
import ENV from "@/ENV.dev";

export const getAllBillList = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");

    if (isNaN(page)) {
      res.json({
        code: 400,
        msg: "page must be a number",
      });
      return;
    }

    const result = await findWithPagination(ENV.DB.collectionName.bill, {
      project: {
        _id: 0,
        id: 1,
        bookName: 1,
        price: 1,
        time: 1,
        status: 1,
      },
      page,
      pageSize: ENV.DB.paginationSize.bill,
    });

    res.json({
      code: 200,
      msg: "success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const getBillDetail = async (req: Request, res: Response) => {
  try {
    const id = req.query.id;

    if (!id) {
      res.json({
        code: 400,
        msg: "id is required",
      });
      return;
    }

    const result = await find(ENV.DB.collectionName.bill, {
      filter: {
        id,
      },
      project: {
        _id: 0,
      },
    });

    res.json({
      code: 200,
      msg: "success",
      data: result[0],
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const auditBill = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res.json({
        code: 400,
        msg: "id and status are required",
      });
      return;
    }

    if ([-1, 2, 3].includes(status)) {
      res.json({
        code: 400,
        msg: "status invalid",
      });
      return;
    }

    const updateResult = await updateOne(
      ENV.DB.collectionName.bill,
      {
        id,
      },
      {
        $set: {
          status,
        },
      }
    );

    if (updateResult.modifiedCount === 1) {
      res.json({
        code: 200,
        msg: "success",
      });
      return;
    }

    res.json({
      code: 500,
      msg: "server error",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};
