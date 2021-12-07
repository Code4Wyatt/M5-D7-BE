import express from "express"
import uniqid from "uniqid"
import multer from "multer"
import createHttpError from "http-errors"
import { saveFileImages, getFiles, writeFiles } from "../../lib/fs-tools.js"
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { validationResult } from "express-validator"

const filesRouter = express.Router()

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'strivebox'
    }
})

const uploader = multer({
    // fileFilter: (req, file, multerNext) => {
    //     if (file.mimetype !== "image/gif") {
    //         multerNext(createHttpError(400, "Only .gif files are allowed"))
    //     } else {
    //         multerNext(null, true)
    //     }
    // },
    storage
}).single("fileImage")


filesRouter.post("/", uploader, async (req, res, next) => {
    try {
        console.log("BODY: ", req.body)

        const newFile = { ...req.file, title: req.body.title, createdAt: new Date(), id: uniqid(), isStarred: false }
        
        console.log(newFile)

        const files = await getFiles()

        files.push(newFile)
        console.log(req.file)
        await writeFiles(files)

        res.status(201).send(`File uploaded!`)
    } catch (error) {
        next(error)
    }
})

filesRouter.get("/", async (req, res, next) => {
    try {
        const files = await getFiles()

        res.send(files)
    } catch (error) {
        next(error)
    }
})

filesRouter.patch("/:id/isStarred", async (req, res, next) => {
    try {
        const files = await getFiles()

        const index = files.findIndex(file => file.id === req.params.id)

        const isStarred = files[index].isStarred

        files[index]= {...files[index], updatedAt: new Date(), isStarred: !isStarred}

        await writeFiles(files)

        res.send(files[index])
    } catch (error) {
        next(error)
    }
})


export default filesRouter