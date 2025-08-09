const fs = require("fs");
const path = require("path");
const multer = require("multer");
import type { Request } from "express";

type fileType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
};

type cbType = (error: Error | null, path: string) => void;

const storage = multer.diskStorage({
  destination: async function (req: Request, file: fileType, cb: cbType) {
    const id = req.body?.id;
    if (!id) return;
    const dirPath = path.join("uploadImage", id);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },
  filename: function (req: Request, file: fileType, cb: cbType) {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return;
    }

    if (file.fieldname === "coverSrcFile") {
      const fileName = "cover." + file.originalname.split(".").pop();
      cb(null, fileName);
      return;
    }

    const fileName = Buffer.from(file.originalname, "latin1").toString("utf-8");
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage, size: 1024 * 1024 * 50 });
export default upload;
