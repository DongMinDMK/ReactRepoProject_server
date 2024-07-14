const express = require("express");
const path=require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({resave:false, saveUninitialized:false, secret:"abcd"}));

app.set("port", process.env.PORT || 5000); // process.env.PORT 시스템 포트번호

app.use("/img", express.static(path.join(__dirname, "uploads"))); // upload 용 static 설정

const memberRouter = require("./Routers/members");
app.use("/members", memberRouter);
const boardRouter = require("./Routers/boards");
app.use("/boards", boardRouter);

app.get("/",(req,res)=>{
    res.send("<h1>Hello World!!</h1>");
});


app.listen(app.get("port"), ()=>{console.log(app.get("port"), "익스프레스 포트 서버 오픈")});

// express 서버 구동 순서
// 1. npm init
// 2. npm i express
// 3. npm i nodemon : 개발환경이므로 필수 사항은 아닙니다.
// 4. app.js 또는 index.js 또는 main 에 지정한 파일(서버의 시작파일)을 제작합니다.
// 5. package.json 의 scripts 에 "start" : "nodemon app" 를 추가합니다.
// 6. npm app 또는 npm run start(npm start) 로 서버를 시작합니다. 