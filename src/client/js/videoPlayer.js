const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

//controlsTimeout은 마우스가 비디오안에들어왔다가 나갔다 다시들어오면
//handleMouseLeave 이벤트를 취소하여 컨트롤러사라지는거 막기위해필요한 아이디
let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;

video.volume = volumeValue;
const handlePlayClick = (e) => {
  video.paused?video.play():video.pause();
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  video.muted?video.muted = false :video.muted = true;
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
    // Math.floor 소수점제거
  // if (!isNaN(video.duration)) {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
  // }
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {target: { value },} = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();//exitFullscreen은 document에서
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();//requestFullscreen은 element에서
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  //마우스가 비디오바깥으로나가면 컨트롤러꺼짐
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  //마우스가 정지해있으면 컨트롤러꺼짐
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handlekeyDown = (event) => {
  if(event.shiftKey){
    switch (event.keyCode) {
      case 37://shift + 왼쪽화살표 5초전  
        video.currentTime -= 5;
      break;
      case 39 ://shift + 왼쪽우측 화살표 5초후
        video.currentTime += 5;
      break;
    }
  }else{
    switch (event.keyCode) {
      case 32://스페이스바
        handlePlayClick();
        break;
      case 77 : //m 뮤트
        handleMuteClick();
        break;
      case 70 ://f 풀스크린
        handleFullscreen();
        break;
      case 27://esc
        handleFullscreen();
        break;          
      case 37://왼쪽화살표 1초전
        video.currentTime -= 1;
         break;
      case 39://오른쪽화살표 1초후
        video.currentTime += 1;
        break;
    } 
  }
  handleMouseMove()//입력중컨트톨러안꺼짐
};

const handleMouseClick = () => video.paused?handlePlayClick():handlePlayClick();

const handleEnded = () => {
  //dataset pug의 data-??을 불러옴(data attribute)
  const { id } = videoContainer.dataset;  
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
//metadata 비디오를제외한 모든것
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);//ended 비디오끝났을때 
timeline.addEventListener("input", handleTimelineChange);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
fullScreenBtn.addEventListener("click", handleFullscreen);
document.addEventListener("keydown", handlekeyDown, false);
video.addEventListener("click", handleMouseClick);
video.addEventListener("canplay", handleLoadedMetadata);
handleLoadedData();
