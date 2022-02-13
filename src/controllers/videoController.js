import Video from "../models/Video";//스키마들
import User from "../models/User";
import Comment from "../models/Comment";


//pug에서 pageTitle읽으려면 =pageTitle(이거한개만) #{pageTitle}(여러개) 

export const home = async (req, res) => {
  //{}이렇게만두면 어느것이든 가능
  const videos = await Video.find({})
  .sort({ createdAt: "desc" })
  .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; //const id = req.params.id 와같다
  //populate owner의정보를불러와 집어넣음(relationship)
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video  });
};  

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {user: { _id },} = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");//403 forbidden
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const {user: { _id },} = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;//pug의 input name을 title로 정해서 title임 name안적으면 body안나옴
  //const video = await Video.findById(id);
  const video = await Video.exists({ _id: id });//id있는지만체크하면되니까 exists사용.체크 _id는 데이터베이스의 id 컬럼명
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the the owner of the video.");
    return res.status(403).redirect("/");
  }
  // video.title = title;
  // video.description = description;
  // video.hashtags = hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
  // await video.save();
  await Video.findByIdAndUpdate(id, {
    title,description,hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {user: { _id },} = req.session;
  const { video, thumb } = req.files;//router의 fields 사용하려면 file대신 files사용
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path.replace(/[\\]/g, "/"),
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        //^a a로시작함 a$ a로끝남 $regex정규식줄인말 //i 는 대문자소문자구별없이검색가능
       $regex: new RegExp(`${keyword}$`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    //status : 랜더하기전에 상태코드 정하는거
    //sendStatus:상태코드보내고 연결끊음//에러별로상관없는것들에
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);//sendStatus 보내고 끝내버림
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  //200 ok 201 created
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  //커맨트 검색후 지우기
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).render("404", { pageTitle: "Comment not found." });
  }
  if (String(comment.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Comment.findByIdAndDelete(id);

  //비디오정보에서 커멘트지우기
  const video = await Video.findById(comment.video);
  video.comments.splice(video.comments.indexOf(_id), 1);
  await video.save();

  return res.sendStatus(200);
};

