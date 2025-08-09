import express from "express";
import cookieParser from "cookie-parser";
import "tsconfig-paths/register";

import upload from "@/utils/multerConfig";

import { signin, signup, signout, userAuth } from "@/api/user/auth";
import { adminSignIn, adminAuth } from "@/api/admin/auth";
import { recommendList } from "@/api/user/book";
import { onSaleList, bookDetail } from "@/api/data";
import {
  getAllBookList,
  addBook,
  modifyBook,
  deleteBook,
} from "@/api/admin/book";

import {
  getUserBillList,
  getUserBillDetail,
  submitBill,
  cancelBill,
} from "@/api/user/bill";
import { auditBill, getAllBillList, getBillDetail } from "@/api/admin/bill";

import { getNoticeList, getNoticeDetail } from "@/api/notice";
import { addNotice, deleteNotice, modifyNotice } from "@/api/admin/notice";

import ENV from "@/ENV.dev";
import { getPublicKey } from "./api/admin/publicKey";

const PORT = ENV.PORT || 2999;

const app = express();
app.use(cookieParser(ENV.COOKIE.SECRET));
app.use(express.json());

app.use("/static", express.static("uploadImage"));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  if (
    (!origin && !referer) ||
    (origin && !ENV.allowedOrigins.includes(origin)) ||
    (referer &&
      !ENV.allowedOrigins.includes(referer.slice(0, referer.length - 1)))
  ) {
    console.log(`Forbidden: ${origin}`);

    res.send({
      code: 403,
      msg: "Forbidden",
    });
    return;
  }

  res.header("Access-Control-Allow-Origin", origin);
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

//====================| token |====================//
// user
// 注册
app.post("/signup", signup);
// 登录
app.post("/signin", signin);
// 登出
app.get("/signout", signout);

// admin
// 登录
app.post("/admin/signin", adminSignIn);
// 登出
app.get("/admin/signout", signout);

// publicKey
app.get("/admin/get-public-key", getPublicKey);

//====================| data |====================//
// 获取主页推荐图书列表
app.get("/recommend", recommendList);
// 获取待售图书列表
app.get("/books", onSaleList);
// 获取图书详情
app.get("/book/:id", bookDetail);

// admin
// 获取图书列表
app.get("/admin/books", adminAuth, getAllBookList);

const bookImgUpload = upload.fields([
  {
    name: "coverSrcFile",
    maxCount: 1,
  },
  {
    name: "imgSrcFile",
    maxCount: 8,
  },
]);
// 添加图书
app.post("/admin/book", adminAuth, bookImgUpload, addBook);
// 修改图书
app.put("/admin/book", adminAuth, bookImgUpload, modifyBook);
// 删除图书
app.delete("/admin/book", adminAuth, deleteBook);

//====================| bill |====================//
// user
// 查看个人订单列表
app.get("/bills", userAuth, getUserBillList);
// 查看订单详情
app.get("/bill/:id", userAuth, getUserBillDetail);
// 提交订单
app.post("/bill", userAuth, submitBill);
// 取消订单
app.put("/bill", userAuth, cancelBill);

// admin
// 查看所有订单列表
app.get("/admin/bills", adminAuth, getAllBillList);
// 查看订单详情
app.get("/admin/bill/:id", adminAuth, getBillDetail);
// 审核订单
app.put("/admin/bill", adminAuth, auditBill);

//====================| 留言 |====================//
// user
// 发表评论
// 点赞评论
// 修改评论

// admin
// 删除评论

//====================| 公告 |====================//
// 查看公告
app.get("/notices", getNoticeList);

// 查看公告详情
app.get("/notice/:id", getNoticeDetail);

// admin
// 添加公告
app.post("/admin/notice", adminAuth, addNotice);
// 修改公告
app.put("/admin/notice", adminAuth, modifyNotice);
// 删除公告
app.delete("/admin/notice", adminAuth, deleteNotice);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
