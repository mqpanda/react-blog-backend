import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import * as dotenv from "dotenv";
dotenv.config();

import { registerValidation, loginValidation, postCreateValidation } from "./validations.js";
import { handleValidationErrors, checkAuth } from './utils/index.js'
import { UserController, PostController } from "./controllers/index.js";



mongoose
  .set("strictQuery", false)
  .connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log("DB has error", err));

const app = express();

const storage = multer.diskStorage(
    {
        destination: (_, __, cb) => {
            cb(null, 'uploads')
        },
        filename: (_, file, cb) => {
            cb(null, file.originalname);
        },
    }
);

const upload = multer({ storage });

const PORT = process.env.PORT || 4400;

app.use(express.json()); // JSON for req
app.use('/uploads', express.static('uploads'))

app.post("/auth/signin", loginValidation, handleValidationErrors, UserController.login);
app.post("/auth/signup", registerValidation, handleValidationErrors, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    });
  });

app.get('/posts', PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postCreateValidation, handleValidationErrors, PostController.update);



app.listen(PORT, (err) => {
  //server start
  if (err) {
    return console.log(err);
  }

  console.log(`Server started on port ${PORT}`);
});
