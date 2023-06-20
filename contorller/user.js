const express = require('express')
const router = express.Router()
const connect = require('../database/connect')
let jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { checkToken,checkPassword } = require('./check_token_password')
const connection = require('../database/connect')

const secretKey = 'a'

// registerUser
router.post('/registerUser', async (req, res) => {
    const {username,password,nickname,status} = req.body;

    switch(true){
        case(!username):
            res.status(400).json({ code: 404, message: "กรุณากรอก username" })
            break
        case(!password):
            res.status(400).json({ code: 404, message: "กรุณากรอก password" })
            break
        case(!nickname):
            res.status(400).json({ code: 404, message: "กรุณากรอก nickname" })
            break
        case(!status):
            res.status(400).json({ code: 404, message: "กรุณาเลือก status " })
            break
        default: break
    }  

    try{
        const hashedPassword = await bcrypt.hash(password,10)

        // check username
        connect.query(
            'SELECT * FROM user WHERE username = ?',
            [username],
            (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err)
                    return res.status(400).send()
                } else {
                    if(result.length > 0){
                        return res.status(201).json({ message: "มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว...." })
                    }else{
                        // create user
                        connect.query(
                            "INSERT INTO user(username,password,nickname,status_user) VALUES (?,?,?,?)",
                            [username,hashedPassword,nickname,status],
                            (err, result, fields) => {
                                if (err) {
                                    console.log("Error ====> ", err)
                                    return res.status(400).send()
                                } else {
                                    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" })
                                }
                            }
                        )
                    }
                }
            }
        )
    }catch(err){
        console.log(err)
        return res.status(500).send()
    }
})

// loginUser
router.post('/loginUser', async(req,res) => {
    const {username,password} = req.body

    switch(true){
        case (!username):
            res.status(400).json({ code: 404, message: "กรุณากรอก username" })
            break
        case(!password):
            res.status(400).json({ code: 404, message: "กรุณากรอก password" })
            break
        default: break
    }

    try{
        // check username
        connect.query(
            'SELECT * FROM user WHERE username = ?',
            [username],
            (err, result, fields) => {
              if (err) {
                console.log('Error ====> ', err)
                return res.status(400).send()
              } else {
                if (result.length > 0) {
                     const is_password = checkPassword(password,result[0].password)
                    if(is_password){
                        // console.log("id ====> ",result[0].id_user)
                        // console.log("username ====> ",result[0].username)
                        const user = { id: result[0].id_user, username: result[0].username }
                        const token = jwt.sign(user, secretKey, { expiresIn: '24h' })
                        // console.log(token)
                        return res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ',payload: result,token,expiresIn: '24h' })
                    }else{
                        return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' })
                    }
                } else {
                  return res.status(401).json({ message: 'เกิดข้อผิดพลาด' })
                }
              }
            }
          )       
    }catch(err){
        console.log(err);
        return res.status(500).send();
    }
})

// getUserAll
router.get('/getUser', async(req,res) => {
    const token = req.headers['authorization']
    const decodedToken = checkToken(token,secretKey)

    if (decodedToken) {
        try {
            connect.query(`
            SELECT u.id_user,u.username,u.password,u.nickname,us.status FROM user u 
            JOIN user_status us on u.status_user = us.id_status`

            , (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err)
                    return res.status(400).send()
                } else {
                    return res.status(200).json(result)
                }
            });
        } catch (err) {
            console.log(err)
            return res.status(500).send();
        }
    }else{
        return res.status(403).json({ message: 'Invalid token' })
    }
})

// updateUser
router.post('/updateUser', async(req,res) => {
    const { id_user,username,password,nickname,status } = req.body;

    switch(true){
        case(!id_user):
        res.status(400).json({ code: 404, message: "กรุณาระบุ id_user" })
        break
        case(!username):
            res.status(400).json({ code: 404, message: "กรุณากรอก username" })
            break
        case(!password):
            res.status(400).json({ code: 404, message: "กรุณากรอก password" })
            break
        case(!nickname):
            res.status(400).json({ code: 404, message: "กรุณากรอก nickname" })
            break
        case(!status):
            res.status(400).json({ code: 404, message: "กรุณาเลือก status " })
            break
        default: break
    } 
    const hashedPassword = await bcrypt.hash(password,10)
    const token = req.headers['authorization']
    const decodedToken = checkToken(token,secretKey)

    if(decodedToken){
        try{
            connect.query(
                `UPDATE user SET username = ? , password = ? , nickname = ? , status_user = ?
                WHERE id_user = ? `,
                [username,hashedPassword,nickname,status,id_user],
                (err, result, fields) => {
                    if (err) {
                        console.log("Error ====> ", err);
                        return res.status(400).send();
                    } else {
                        return res.status(201).json({ message: "อัพเดพข้อมูลสำเร็จ" })
                    }
                }
            )
        }catch(err){
            console.log(err);
            return res.status(500).send()
        } 
    }else{
        return res.status(403).json({ message: 'Invalid token' })
    }
})

// deleteUser
router.delete('/deleteUser', async(req,res) => {
    const { id_user } = req.body
    const token = req.headers['authorization']
    const decodedToken = checkToken(token,secretKey)

    if(decodedToken){
        try{
            connection.query("DELETE FROM user WHERE id_user = ?",[id_user], (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err);
                    return res.status(400).send();
                } else {
                    return res.status(201).json({ message: "ลบข้อมูลสำเร็จ" })
                }
            })
        }catch(err){
            console.log(err);
            return res.status(500).send()
        }
    }else{
        return res.status(403).json({ message: 'Invalid token' })
    }
})

module.exports = router;
