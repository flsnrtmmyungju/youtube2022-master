//package.json에 webpack 만적어도 이파일찾아옴
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const BASE_JS = "./src/client/js/";

module.exports = {//이렇게 오래전방식 으로해야함
    entry: {//우리가 처리하고자하는파일
        main: BASE_JS + "main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recorder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js",
    },
    //아래두줄 pakage.json에 직접입력했음 1. --mode=입력 2.-w
    // mode: "development",//개발중이라 코드압축안함
    // watch: true,//내용변경시 재실행//이말은 서버따로 백엔드따로실행해야함
    plugins: [
        new MiniCssExtractPlugin({
        filename: "css/styles.css",
        }),
    ],
    output: {
        filename: "js/[name].js",
        //webpack은절대걍로필요//path.resolve:입력하는파트들모아서 경로로만들어줌
        //__dirname(자바스크립트기능) 현재폴더까지 절대경로불러옴
        path: path.resolve(__dirname, "assets"),
        clean: true,//실행시 assets폴더삭제
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    },
                },
            },
            {
                test: /\.scss$/,
                //webpack은 거꾸로실행해서 sass-loader 가제일먼저실행
                // style-loader이라는 loader를 사용하면, javascript코드가 css파일을 읽는데,
                // 우리는 css파일 따로, js파일 따로 웹팩으로 번들화 시키고싶다. 한번에 할 경우 js 로딩을 기다려야하기 때문이다.
                // 그래서 MiniCssExcractPlugin.loader를 사용한다.
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
};