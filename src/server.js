
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware ,s3DeleteAvatarMiddleware} from "./middlewares";

const app = express();//순서는 use - > get 순이다express는 위에서아래로실행
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");//이거안해주면 작업위치를 src폴더 밖으로 봐서 퍼그못찾음

const logger = morgan("dev");
app.use(logger);

//html form이해하여 javascript object 형식으로 통역(body내용보기위해)(extended는 보기좋게 형식갖춰줌) 라우트사용전에사용해야함
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//세션 기억할수있음
app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,//세션수정할때만 db에저장,쿠키넘겨줌==로그인사용자만 세션저장
      // cookie:{ //자동세션삭제 시간
      //   maxAge: 
      // }
      store: MongoStore.create({ mongoUrl: process.env.DB_URL })//mongodb에 세션저장
    })
);
//!!sharedArrayBuffer 에러날때
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
}); 
//세션콘솔에표시
// app.use((req, res, next) => {
//   req.sessionStore.all((error, sessions) => {
//     console.log(sessions);
//     next();
//   });
// });
app.use(s3DeleteAvatarMiddleware);
app.use(flash());
app.use(localsMiddleware);//위치중요
app.use("/uploads", express.static("uploads"));//폴더전체를브라우저에노출
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;


