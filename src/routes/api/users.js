const express = require("express");
const authorize = require("../../middlewares/authorize");
const {
  catchRegErrors,
  catchLogErrors,
  catchErrors,
} = require("../../middlewares/catch-errors");
const { postAuthValidation } = require("../../middlewares/validationSchema");
const router = express.Router();

const {
  signupUser,
  loginUser,
  currentUser,
  logoutUser,
  avatarsUpdate,
} = require("../../models/users");

const multer = require("multer");
const mime = require("mime-types");
const uuid = require("uuid");


const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const extname = mime.extension(file.mimetype);
      const filename = uuid.v4() + "." + extname;
      cb(null, filename);
    },
    destination: "./tmp",
  }),
});

router.post(
  "/signup",
  postAuthValidation,
  catchRegErrors(async (req, res, next) => {
    const user = await signupUser(req.body);
    res.status(201).json({
      contentType: "application/json",
      ResponseBody: { user },
    });
  })
);

router.post(
  "/login",
  postAuthValidation,
  catchLogErrors(async (req, res, next) => {
    const { token, email, subscription } = await loginUser(req.body);
    res.status(201).json({
      contentType: "application/json",
      ResponseBody: {
        user: {
          email: email,
          subscription: subscription,
        },
        token: token,
      },
    });
  })
);

router.get(
  "/logout",
  authorize,
  catchErrors(async (req, res, next) => {
    await logoutUser(req.user.token);
    res.sendStatus(204);
  })
);

router.get(
  "/current",
  authorize,
  catchErrors(async (req, res, next) => {
    const user = await currentUser(req.user.token);
    res.status(200).send(user);
  })
);

router.patch(
  "/avatars",
  authorize,
  upload.single("avatar"),
  catchErrors(async (req, res, next) => {
    // console.log("req", req.file);
    const user = await avatarsUpdate(req.user.token, req.file);
    
    res.status(200).send(user);
  })
);

module.exports = router;
