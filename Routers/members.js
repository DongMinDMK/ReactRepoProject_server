const express = require("express");
const router = express.Router();
const path = require("path");
const mysql = require("mysql2/promise");

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


router.post("/login", async(req,res,next)=>{
    const {userid, pwd} = req.body;
    try{
        const connection = await getConnection();
        const sql = "select* from member where userid=?";
        const [rows, fields] = await connection.query(sql, [userid]);

        if(rows.length >= 1){
            if(rows[0].pwd == pwd){
                const uniqueInt = Date.now();
                req.session[uniqueInt] = rows[0];
                res.cookie("session", uniqueInt, {httpOnly:true, path:"/"});
                return res.send({msg:"OK"});
            }else{
                return res.send({msg:"비밀번호가 일치하지 않습니다."});
            }
        }else{
            return res.send({msg:"아이디가 일치하지 않습니다."});
        }
    }catch(err){
        next(err);
    }
})

router.post("/join", async(req,res,next)=>{
    const{userid, pwd, name, email, phone} = req.body;

    try{
        const connection = await getConnection();
        const sql = "insert into member(userid, pwd, name, email, phone) values(?,?,?,?,?)";
        const [result, fields] = await connection.query(sql, [userid, pwd, name, email, phone]);

        res.send({msg:"OK"});

    }catch(err){
        next(err);
        res.send({msg:"NO"});
    }
});

router.get("/getMember", async(req,res)=>{
    const loginUser = req.session[req.cookies.session];
    res.send(loginUser);
});

router.get("/logout", async(req,res)=>{
    if(req.cookies.session){
        delete req.session[req.cookies.session];
        res.clearCookie("session", req.cookies.session, {httpOnly:true, path:"http://localhost:3000/"});
    }else{
        req.session.destroy();
    }

    res.redirect("http://localhost:3000/");
});

router.post("/updateMember", async(req,res,next)=>{
    const {userid, pwd, name, email, phone} = req.body;

    try{
        const connection = await getConnection();
        const sql = "update member set pwd=?, name=?, email=?, phone=? where userid=?";
        const [result, fields] = await connection.query(sql, [pwd, name, email, phone, userid]);
        req.session[req.cookies.session] = {userid, pwd, name, email, phone};

        res.send({msg:"OK"});

    }catch(err){
        next(err);
        res.send({msg:"NO"});
    }
});



module.exports = router;

