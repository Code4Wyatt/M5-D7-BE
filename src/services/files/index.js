import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"

import filesRouter from "./services/files/index.js"

import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notFoundHandler } from "./errorHandlers.js"

const server = express()

const port = process.env.PORT

const publicFolderPath = join(process.cwd(), "./public")

server.use(express.static(publicFolderPath))
server.use(loggerMiddleware)

const whiteList = [process.env.FE_LOCAL_URL, process.env.FE_REMOTE_URL]

const corsOptions = {
    origin: function (origin, next) {
        console.log("ORIGIN: ", origin)
        if (!origin || whiteList.indexOf(origin) !== -1) {
            next(null, true)
        } else {
            next(new Error("Cors Error"))
        }
    }
}

server.use(cors(corsOptions))
server.use(express.json())


server.use("/files", filesRouter)


server.use(badRequestHandler)
server.use(genericErrorHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)

console.table(listEndpoints(server))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
