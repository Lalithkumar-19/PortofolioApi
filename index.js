const express = require("express");
const mongoose = require("mongoose");
const Cart = require("./models/Cart");
const cookieparser = require("cookie-parser")
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const Admin = require("./models/Admin");
const UploadMiddleware = multer({ dest: 'uploads/' })
const jwt = require("jsonwebtoken");
const secret = process.env.secret;
mongoose.set('strictQuery', false)
const app = express();
require("dotenv").config();
app.use(cors({ origin:"*", credentials: true , }))
app.use(express.json());
app.use(cookieparser())
app.use('/uploads', express.static(__dirname + "/uploads"));
mongoose.connect(process.env.Mongo_Url).then(() => console.log("connected to db")).catch(err => console.log(err))

app.get("/", (req, res) => {
    res.send("hello lalith kumar!!")
})
app.post("/card", UploadMiddleware.single('file'), async (req, res) => {
    const {token} = req.body.token?req.body:null;
    console.log("token", token);
    try {
        if (token) {
            jwt.verify(token, secret, {}, async (err, info) => {
                if (err) throw err;
    
                const { originalname, path } = req.file;
                const parts = originalname.split('.');
                const ext = parts[parts.length - 1];
                const newpath = path + '.' + ext;
                fs.renameSync(path, newpath);
                const { code, view, content } = req.body;
                const postDoc = await Cart.create({
                    img: newpath,
                    content: content,
                    code: code,
                    view: view,

                })
                res.status(200).json("uploaded successfully !!!")
                console.log(postDoc);

            })

        }
        else {
            res.status(500).json("unauthorized request to made changes");
        }



    } catch (err) {
        if (err) throw err;
        res.status(500).json('not created');
    }
})

app.get("/cart", async (req, res) => {
    const CartData = await Cart.find();
    res.json(CartData);



})

app.post("/login", async (req, res) => {

    const { email, password } = req.body;
    try {
        if ((!email) && (!password)) {

            res.status(402).json("no credentials emtered");
            console.log("credentials are wrong");


        } else {
            console.log("credentials are ", email, password);
            const admindoc = await Admin.findOne({ adminemail: email })
            if (admindoc) {
                if (admindoc.adminemail === email && admindoc.adminpassword === password) {
                    jwt.sign({ email, password }, secret, {}, (err, token) => {
                        if (err) throw err;
                        res.status(200).cookie('token', token).json({
                            token: token,

                        })
                        console.log("pass okk");
                    })


                } else {
                    res.status(402).json("wrong credentials")
                }
            }
            else {
                res.status(420).json("admin email and password not match");
            }


        }
    } catch (err) {
        if (err) throw err;
        res.status(400).json("ur not admin!....")
    }
})

app.post("/deleteitem", async (req, res) => {
    const { id, img, token } = req.body;
    console.log(token);
    try {
        if (token) {
            jwt.verify(token, secret, {}, async (err, info) => {
                if (err) throw err;
                if (info) {
                    fs.unlink(__dirname + '/' + img, (err) => {
                        if (err) throw err;
                        console.log("image deleted successfully!")
                    });

                    const cartdet = await Cart.findById(id);
                    await Cart.deleteOne({ _id: cartdet.id }).then((suc) => {
                        res.status(200).json("deleted sucessfully")
                    }).catch(err => console.log(err))
                }
                else {
                    res.status(420).json("Your not the owner to make changes")
                }
            })
        }
        else {
            res.status(420).json("You dont have access to modify!!")
        }


    } catch (err) {
        if (err) throw err;

    }
})






app.listen(process.env.port||2000, () => console.log("connected to port 2000"))