import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

import {
  deleteData,
  find,
  findWithPagination,
  insert,
  updateOne,
} from "@/utils/mongoDB";
import ENV from "@/ENV.dev";

export const getAllBookList = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");

    if (isNaN(page) || page < 1) {
      res.json({
        code: 400,
        msg: "page is not a number or not provided",
      });
      return;
    }

    const result = await findWithPagination(ENV.DB.collectionName.book, {
      project: {
        _id: 0,
        coverSrc: 0,
        imgSrc: 0,
        author: 0,
      },
      sort: {
        inputTime: -1,
      },
      page,
      pageSize: ENV.DB.paginationSize.bookList,
    });

    if (page > result.totalPages && result.totalPages !== 0) {
      res.json({
        code: 404,
        msg: "page out of range",
      });
      return;
    }

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

export const addBook = async (req: Request, res: Response) => {
  try {
    const { id, name, author, category, price, coverSrc, imgSrc } = req.body;

    if (!id || !name || !author || !category || !price || !coverSrc) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    const findResult = await find(ENV.DB.collectionName.book, {
      filter: { id },
      project: {
        id: 1,
      },
    });

    if (findResult.length > 0) {
      res.json({
        code: 409,
        msg: "id already exists",
      });
      return;
    }

    await insert(ENV.DB.collectionName.book, {
      id,
      name,
      author,
      category,
      inputTime: Date.now(),
      status: true,
      price: Number(price),
      coverSrc:
        path.sep +
        path.join("static", id, "cover." + coverSrc.split(".").pop()),
      imgSrc: JSON.parse(imgSrc).map(
        (src: string) => path.sep + path.join("static", id, src)
      ),
    });

    res.json({
      code: 200,
      msg: "success",
      data: id,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: "server error",
    });
  }
};

export const modifyBook = async (req: Request, res: Response) => {
  try {
    const { id, name, author, price, coverSrc, imgSrc } = req.body;

    if (!id) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    const changeInfo = {} as Record<string, any>;

    if (name && typeof name === "string") {
      changeInfo.name = name;
    }

    if (author && typeof author === "string") {
      changeInfo.author = author;
    }

    if (price && !isNaN(Number(price))) {
      changeInfo.price = Number(price);
    }

    if (
      (coverSrc && typeof coverSrc === "string") ||
      (imgSrc && imgSrc.startsWith("[") && imgSrc.endsWith("]"))
    ) {
      const findResult = await find(ENV.DB.collectionName.book, {
        filter: { id },
        project: {
          coverSrc: 1,
          imgSrc: 1,
        },
      });

      if (findResult.length === 0) {
        res.json({
          code: 404,
          msg: "book not found",
        });
        return;
      }

      if (coverSrc && typeof coverSrc === "string") {
        if (!findResult[0].coverSrc.includes(coverSrc)) {
          fs.unlink(path.join("uploadImage", findResult[0].coverSrc));
        }

        changeInfo.coverSrc =
          path.sep +
          path.join("static", id, "cover." + coverSrc.split(".").pop());
      } else {
        const deleteList = {} as Record<string, boolean>;
        findResult[0].imgSrc.forEach((src: string) => {
          deleteList[src] = true;
        });

        let value = JSON.parse(imgSrc);
        changeInfo.imgSrc = value.map((src: string) => {
          if (src.startsWith(path.sep + "static")) {
            delete deleteList[src];
            return src;
          }

          return path.sep + path.join("static", id, src);
        });

        for (const src in deleteList) {
          if (deleteList[src]) {
            fs.unlink(
              path.join("uploadImage", ...src.split(path.sep).slice(2))
            );
          }
        }
      }
    }

    await updateOne(
      ENV.DB.collectionName.book,
      { id },
      {
        $set: changeInfo,
      }
    );

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

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      res.json({
        code: 400,
        msg: "params error",
      });
      return;
    }

    const findResult = await find(ENV.DB.collectionName.book, {
      filter: { id },
    });

    if (findResult.length === 0) {
      res.json({
        code: 404,
        msg: "book not found",
      });
      return;
    }

    if (findResult[0].status === false) {
      res.json({
        code: 403,
        msg: "book has been sold out!",
      });
      return;
    }

    const deleteResult = await deleteData(ENV.DB.collectionName.book, { id });

    if (deleteResult.deletedCount === 0) {
      res.json({
        code: 404,
        msg: "delete failed",
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
