const express = require('express');
const router = express.Router();
const connect = require('../database/connect')
const secretKey = 'a'
const { checkToken } = require('./check_token_password')

// createItem
router.post("/create", async (req, res) => {
    const { item } = req.body;
    switch(true){
        case(!item):
            res.status(400).json({ code: 404, message: "please input item" });
        break
        default: break
    }
    try {
        connect.query(
            "INSERT INTO item(item) VALUES (?)",
            [item],
            (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err);
                    return res.status(400).send();
                } else {
                    return res.status(201).json({ message: "Create item Successfully...." });
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// getAllItem
router.get("/getallItem", async (req, res) => {
    const token = req.headers['authorization']

    const decodedToken = checkToken(token,secretKey)

    if(decodedToken){
        try {
            connect.query("SELECT * FROM item", (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err);
                    return res.status(400).send();
                } else {
                    return res.status(200).json(result);
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(500).send();
        }
    }else{
        return res.status(403).json({ message: 'Invalid token' })
    }  
})

// findOneItem
router.get("/findItem/:id", async (req, res) => {
    const id = req.params.id;
    switch(true){
        case(!id || id.trim() === ""):
            res.status(400).json({ error: "Missing or empty 'id' parameter" })
        break
        default: break
    }
    try {
        connect.query("SELECT * FROM item WHERE id = ?", [id], (err, result, fields) => {
            if (err) {
                console.log("Error ====> ", err);
                return res.status(400).send();
            } else {
                if (Array.isArray(result) && result.length === 0) {
                    console.log("result is an empty array");
                    return res.status(201).json({ message: "undefind item" });
                } else {
                    return res.status(200).json(result);
                }
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// editItem
router.post("/editItem/:id", async (req, res) => {
    const id = req.params.id;
    const { item } = req.body;
    try {
        connect.query(
            "UPDATE item SET item = ? WHERE id = ? ",
            [item, id],
            (err, result, fields) => {
                if (err) {
                    console.log("Error ====> ", err);
                    return res.status(400).send();
                } else {
                    return res.status(201).json({ message: "Update item Successfully...." });
                }
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// deleteItem
router.delete("/deleteItem/:id", async (req, res) => {
    const id = req.params.id;
    try {
        connect.query("DELETE FROM item WHERE id = ?", [id], (err, result, fields) => {
            if (err) {
                console.log("Error ====> ", err);
                return res.status(400).send();
            } else {
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "No item with this id" });
                } else {
                    return res.status(200).json({ message: "Delete item Successfully...." });
                }
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

module.exports = router;
