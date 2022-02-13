const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const delBtn = document.querySelectorAll(".delBtn");


const handleDel = async (event) => {
   const delComment = event.target.parentNode//parentElement 같은듯
   const {id} = delComment.dataset;  
    await fetch(`/api/comments/${id}`, {
      method: "DELETE",
    });
    delComment.remove();
};


const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);//prepend맨앞에appendChild맨뒤에
};

const handleSubmit = async (event) => {    
  event.preventDefault();
  const videoId = videoContainer.dataset.id;
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  if (text === "") {
    return;
  }
  //response.status줄여서 const{status} 쓸수있음
  const response = await fetch(`/api/videos/${videoId}/comment`, {      
    method: "POST",
    //json 으로 보낸다고 알림
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";//textarea를 let으로받으면 연결이안되서 ""로 되지않음
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
 form.addEventListener("submit", handleSubmit);
 delBtn.forEach((delBtn) => {delBtn.addEventListener("click", handleDel)});
}