import Video from "../models/Video";//스키마들


//pug에서 pageTitle읽으려면 =pageTitle(이거한개만) #{pageTitle}(여러개) 

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });//{}이렇게만두면 어느것이든 가능
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; //const id = req.params.id 와같다
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};  
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
}

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;//pug의 input name을 title로 정해서 title임 name안적으면 body안나옴
  //const video = await Video.findById(id);
  const video = await Video.exists({ _id: id });//id있는지만체크하면되니까 exists사용.체크 _id는 데이터베이스의 id 컬럼명
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  // video.title = title;
  // video.description = description;
  // video.hashtags = hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
  // await video.save();
  await Video.findByIdAndUpdate(id, {
    title,description,hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { path: fileUrl } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      fileUrl,
      hashtags: Video.formatHashtags(hashtags),
    });
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
        $regex: new RegExp(`${keyword}`, "i"),
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
