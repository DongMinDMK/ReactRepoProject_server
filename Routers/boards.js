const express = require("express");
const router = express.Router();
const path = require("path");
const mysql = require("mysql2/promise");
const multer = require('multer'); 
const fs = require('fs');

async function getConnection(){ //동기식
    let connection = await mysql.createConnection(
        {
            host:"localhost",
            user:"root",
            password:"adminuser",
            database:"board"
        }
    );
    return connection;
}

// 업로드 폴더 생성 - fs 를 require 에서 끌고 온 이유
// 업로드용 폴더로 사용할 폴더를 조사해보고 없으면 생성, 있으면 그 폴더를 이용(그냥 지나감)
try{
    fs.readdirSync("uploads");
}catch(err){
    console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
    fs.mkdirSync("uploads");
}

// multer 를 이용해서 업로드를 수행할 객체를 생성합니다.
// const multerObj = multer();
// const multerObj = multer({storage:multer.diskStorage({ destination(){}, filename(){}, }), limits:{}})
const multerObj = multer(
    {
        storage:multer.diskStorage(
            {
                destination(req, file, done){ // 업로드된 파일이 저장될 폴더 설정
                    done(null, "uploads/");
                },
                filename(req, file, done){ // 업로드된 파일이 저장되기 전 파일이름을 변경하는 설정
                    const ext = path.extname(file.originalname);
                    const fn = path.basename(file.originalname, ext) + Date.now() + ext;
                    // abc.jpg -> abc + "1234567" + ".jpg";
                    done(null, fn);
                },
            }
        ), 
        limits:{
            fileSize: 5 * 1024 * 1024,
        },
    }
);

router.get("/getBoardList", async(req, res, next)=>{
    try{
        const connection = await getConnection();
        const sql = "select* from board order by num desc";
        const [rows, fields] = await connection.query(sql);

        res.send({boardlist:rows });

    }catch(err){
        next(err);
        res.send({msg:"NO"});
    }
});

router.get("/getBoard/:num", async(req,res,next)=>{
    try{
        const connection = await getConnection();
        let sql = "select* from board where num=?";
        const [rows, fields] = await connection.query(sql, [req.params.num]);

        // sql = "select* from reply where boardnum=?"
        // const [rows2, fields2] = await connection.query(sql, [req.params.num]);

        res.send(rows[0])

    }catch(err){
        next(err);
    }
})

router.get("/getReplyList/:num", async(req,res,next)=>{
    try{
        const connection = await getConnection();
        // let sql = "select* from board where num=?";
        // const [rows, fields] = await connection.query(sql, [req.params.num]);

        let sql = "select* from reply where boardnum=?"
        const [rows2, fields2] = await connection.query(sql, [req.params.num]);

        res.send(rows2)

    }catch(err){
        next(err);
    }
})

router.post("/fileupload", multerObj.single("image"), async(req,res)=>{
    const image = req.file.originalname;
    const savefilename = req.file.filename;

    res.json({image:image, savefilename:savefilename});
})

const upObj = multer();

router.post("/insertBoard", upObj.single("image"), async(req, res, next)=>{
    const {userid, pass, email, title, content, image, savefilename} = req.body;

    try{
        const connection = await getConnection();

        const sql = "insert into board(userid, pass, email, title, content, image, savefilename) values(?,?,?,?,?,?,?)";
        const [result, fields] = await connection.query(sql, [userid, pass, email, title, content, image, savefilename]);

        res.send(result);

    }catch(err){
        next(err);
    }
})




module.exports = router;