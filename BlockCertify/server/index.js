//@ts-check
import cors from "cors";
import express from "express";
import morgan from "morgan";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import crypto from "crypto";
import fsp from "fs/promises";
import createHttpError from "http-errors";
import { create } from "ipfs-http-client";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

//constants
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const NODE_ENV = process.env.NODE_ENV || "development";
const APPENDED_DIR = path.join(process.cwd(), "appended");
const IPFS_NODE_HOST = "127.0.0.1";

//utils
async function sha256(filepath) {
  const contentbuff = await fsp.readFile(filepath);
  const hash = crypto.createHash("sha256").update(contentbuff).digest("hex");
  return hash;
}

function catchAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// ✅ FIX: use correct port (5001 for IPFS API)
const ipfs = create({
  host: IPFS_NODE_HOST,
  port: 5001,
  protocol: "http",
});

async function uploadFileToIPFS(filePath) {
  const file = fs.readFileSync(filePath);
  const result = await ipfs.add(file, { pin: true });
  return result.cid.toString();
}

async function appendUUIDtoPDF(uuidStr, pdfInputPath, pdfOutputPath) {
  const pdfBytes = fs.readFileSync(pdfInputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const numPages = pdfDoc.getPageCount();
  for (let i = 0; i < numPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const text = `UUID: ${uuidStr}`;
    const fontSize = 10;
    const x = width - 250;
    const y = height - 20;
    page.drawText(text, { x, y, size: fontSize });
  }

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfOutputPath, modifiedPdfBytes);
}

//setup
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(APPENDED_DIR)) fs.mkdirSync(APPENDED_DIR);

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const id = uuid();
      cb(null, id + ext);
    },
  }),
});

//middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/healthcheck", (req, res) => res.json({ status: "ok" }));

if (NODE_ENV === "development") {
  app.get("/calculatehash", (req, res) => {
    res.send(`
      <form action="/calculatehash" method="post" enctype="multipart/form-data">
        <input type="file" name="certificate" />
        <button type="submit">Calculate Hash</button>
      </form>
    `);
  });

  app.get("/issue", (req, res) => {
    res.send(`
      <form action="/issue" method="post" enctype="multipart/form-data">
        <input type="file" name="certificate" />
        <button type="submit">Issue</button>
      </form>
    `);
  });
}

app.post(
  "/calculatehash",
  upload.single("certificate"),
  catchAsync(async (req, res, next) => {
    if (!req.file) throw new createHttpError.BadRequest("file not found");

    const ext = path.extname(req.file.originalname);
    if (ext !== ".pdf") {
      await fsp.unlink(req.file.path);
      throw new createHttpError.BadRequest("file extension must be .pdf");
    }

    const hash = await sha256(req.file.path);
    await fsp.unlink(req.file.path);
    res.json({ hash });
  })
);

app.post(
  "/issue",
  upload.single("certificate"),
  catchAsync(async (req, res, next) => {
    try {
      if (!req.file) throw new createHttpError.BadRequest("file not found");

      const id = uuid();
      const appendedFilePath = path.join(APPENDED_DIR, id + ".pdf");
      await appendUUIDtoPDF(id, req.file.path, appendedFilePath);

      const hash = await sha256(appendedFilePath);
      const cid = await uploadFileToIPFS(appendedFilePath);

      res.json({
        uuid: id,
        hash,
        ipfsLink: `https://ipfs.io/ipfs/${cid}?filename=${id}.pdf`,
        cid,
      });
    } catch (err) {
      console.error("❌ /issue error:", err);
      res.status(500).json({ error: err.message });
    }
  })
);

app.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});
