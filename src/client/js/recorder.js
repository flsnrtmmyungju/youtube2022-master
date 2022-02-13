import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();//클릭시켜(클릭위해body필요) 다운로드기능실행
};


const handleDownload = async () => {
    actionBtn.removeEventListener("click", handleDownload);
    actionBtn.innerText = "Transcoding...";
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({ corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',log: true });
    await ffmpeg.load();//좀무거울수있어서 await 필요
    //가상으로 파일만듬
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
    //만든파일인코딩 //input                  초당60프레임
   await ffmpeg.run("-i", files.input, "-r", "60", files.output);
                              //ss:특정시간대로이동     //1번째프레임스크린샷찍어줌
   await ffmpeg.run("-i",files.input,"-ss","00:00:01","-frames:v","1",files.thumb);

   //인코딩한파일읽음
   const mp4File = ffmpeg.FS("readFile", files.output);
   const thumbFile = ffmpeg.FS("readFile", files.thumb);

   const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
   const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
 
   const mp4Url = URL.createObjectURL(mp4Blob);
   const thumbUrl = URL.createObjectURL(thumbBlob);

   downloadFile(mp4Url, "MyRecording.mp4");
   downloadFile(thumbUrl, "MyThumbnail.jpg");

   //메모리에서 파일삭제
   ffmpeg.FS("unlink", files.input);
   ffmpeg.FS("unlink", files.output);
   ffmpeg.FS("unlink", files.thumb);

   URL.revokeObjectURL(mp4Url);
   URL.revokeObjectURL(thumbUrl);
   URL.revokeObjectURL(videoFile);

   actionBtn.disabled = false;
   actionBtn.innerText = "Record Again";
   actionBtn.addEventListener("click", handleStart);

};


const handleStart = () => {
    actionBtn.innerText = "Recording";
    actionBtn.disabled = true;
    actionBtn.removeEventListener("click", handleStart);
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
                      //URL: 브라우저상의 메모리
      videoFile = URL.createObjectURL(event.data);
      video.srcObject = null;
      video.src = videoFile;
      video.loop = true;
      video.play();
      actionBtn.innerText = "Download";
      actionBtn.disabled = false;
      actionBtn.addEventListener("click", handleDownload);
    };
    recorder.start();
    setTimeout(() => {
      recorder.stop();
    }, 5000);
  };

const init = async () => {
//프론트엔드상에서 async await 쓰려면  regenerator-runtime 설치필요
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  //srcObject:video가 가질수있는 무언가
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
