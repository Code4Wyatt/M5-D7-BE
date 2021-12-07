import express from "express";
import uniqid from "uniqid";
import multer from "multer";
import createHttpError from "http-errors";
import { getFiles, writeFiles } from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { validationResult } from "express-validator";
import { checkFileSchema } from "../../services/files/validation.js";

const filesRouter = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "strivebox",
  },
});

const uploader = multer({
  // fileFilter: (req, file, multerNext) => {
  //     if (file.mimetype !== "image/gif") {
  //         multerNext(createHttpError(400, "Only .gif files are allowed"))
  //     } else {
  //         multerNext(null, true)
  //     }
  // },
  storage,
}).single("fileImage");

filesRouter.post("/", uploader, checkFileSchema, async (req, res, next) => {
  try {
    console.log("BODY: ", req.body);
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(
        createHttpError(400, "There is a error in the request body", {
          errorsList,
        })
      );
    } else {
      const newFile = {
        ...req.file,
        title: req.body.title,
        createdAt: new Date(),
        id: uniqid(),
        isStarred: false,
      };

      console.log(newFile);

      const files = await getFiles();

      files.push(newFile);
      console.log(req.file);
      await writeFiles(files);

      res.status(201).send(`File uploaded!`);
    }
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/", async (req, res, next) => {
  try {
    const files = await getFiles();

    res.send(files);
  } catch (error) {
    next(error);
  }
});

filesRouter.patch("/:id/isStarred", async (req, res, next) => {
  try {
    const files = await getFiles();

    const index = files.findIndex((file) => file.id === req.params.id);

    const isStarred = files[index].isStarred;

    files[index] = {
      ...files[index],
      updatedAt: new Date(),
      isStarred: !isStarred,
    };

    await writeFiles(files);

    res.send(files[index]);
  } catch (error) {
    next(error);
  }
});

filesRouter.patch("/:id/title", async (req, res, next) => {
  try {
    const files = await getFiles();

    const index = files.findIndex((file) => file.id === req.params.id);

    files[index] = {
      ...files[index],
      updatedAt: new Date(),
      title: req.body.title,
    };

    await writeFiles(files);

    res.send(files[index]);
  } catch (error) {}
});

filesRouter.delete("/:id", async (req, res, next) => {
    cloudinary.uploader.destroy('otn7omlaw8qtiudmifbh', function (result) { res.send(result) });

    
})

export default filesRouter;
