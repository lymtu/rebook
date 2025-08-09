import type { Request, Response } from "express";
import type { Book } from "@/types/book";
import { find, findWithPagination, insert, updateOne } from "@/utils/mongoDB";

import ENV from "@/ENV.dev";

export const getUserBillList = async (req: Request, res: Response) => {
  try {
    const email = req.headers["x-user-email"];

    if (!email) {
      res.json({
        code: 400,
        msg: "",
      });
      return;
    }

    const page = parseInt((req.query.page as string) || "1");
    if (isNaN(page)) {
      res.json({
        code: 400,
        msg: "Missing page",
      });
      return;
    }

    const result = await findWithPagination(ENV.DB.collectionName.bill, {
      filter: {
        email: email,
      },
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
  } catch (err) {
    console.log(err);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const getUserBillDetail = async (req: Request, res: Response) => {
  try {
    const email = req.headers["x-user-email"];
    const id = req.query.id;

    if (!email) {
      res.json({
        code: 400,
        msg: "",
      });
      return;
    }

    if (!id) {
      res.json({
        code: 400,
        msg: "Missing id",
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

export const submitBill = async (req: Request, res: Response) => {
  try {
    const email = req.headers["x-user-email"];
    const { id: bookID, userName } = req.body;

    if (!email) {
      res.json({
        code: 400,
        msg: "",
      });
      return;
    }

    if (!bookID || !userName) {
      res.json({
        code: 400,
        msg: "Missing bookID or userName",
      });
      return;
    }

    const result = await find(ENV.DB.collectionName.book, {
      filter: {
        id: bookID,
      },
    });

    if (result.length === 0) {
      res.json({
        code: 400,
        msg: "Book not found",
      });
      return;
    }

    const bookDetail = result[0] as Book;

    if (!bookDetail.status) {
      res.json({
        code: 400,
        msg: "本书已售出",
      });
      return;
    }

    const updateResult = await updateOne(
      ENV.DB.collectionName.book,
      {
        id: bookDetail.id,
      },
      {
        $set: {
          status: false,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      res.json({
        code: 500,
        msg: "server error",
      });
      return;
    }

    const time = Date.now();
    const billID = time + "-" + bookID;

    await insert(ENV.DB.collectionName.bill, {
      id: billID,
      userName,
      email,
      bookName: bookDetail.name,
      bookID,
      price: bookDetail.price,
      time,
      status: 1,
    });

    res.json({
      code: 200,
      msg: "success",
      data: billID,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const cancelBill = async (req: Request, res: Response) => {
  try {
    const email = req.headers["x-user-email"];

    if (!email) {
      res.json({
        code: 400,
        msg: "",
      });
      return;
    }

    const { id } = req.body;

    if (!id) {
      res.json({
        code: 400,
        msg: "Missing id",
      });
      return;
    }

    const result = await updateOne(
      ENV.DB.collectionName.bill,
      {
        id,
      },
      {
        $set: {
          status: 0,
        },
      }
    );

    if (result.modifiedCount === 0) {
      res.json({
        code: 500,
        msg: "server error",
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
