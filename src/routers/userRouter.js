import express from "express";
import {
    getEdit,
    postEdit,
    logout,
    see,
    startGithubLogin,
    finishGithubLogin,
    getChangePassword,
    postChangePassword,
  } from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware,avatarUpload,} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
//all get,post모두 사용//single:파일한개만보낸단소리,html의 name과 같아야함 
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
//:의 변수를 위에두면 그아래에 있는 리스트들을 전부 변수로봄
userRouter.get("/:id", see);

export default userRouter;