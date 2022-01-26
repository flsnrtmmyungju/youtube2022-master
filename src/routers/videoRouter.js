import express from "express";
import {
    watch,
    getUpload,
    getEdit,
    postEdit,
    postUpload,
    deleteVideo,
  } from "../controllers/videoController";
const videoRouter = express.Router();
import { protectorMiddleware,videoUpload  } from "../middlewares";

//(\\d+) 숫자만 ex videoRouter.get("/:id(\\d+)/delete", deleteVideo);
videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);//아래와두줄 합침
//videoRouter.get("/:id([0-9a-f]{24})/edit", getEdit);
//videoRouter.post("/:id([0-9a-f]{24})/edit", postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.single("video"),postUpload);

export default videoRouter;