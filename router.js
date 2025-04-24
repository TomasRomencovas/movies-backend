import express from "express";
import { getAllMovies, getMovieById } from "./controllers/moviesControllers.js";
import {
  createNewUser,
  getUserDataByEmail,
  getUserEmail,
  loginUser,
  logOut,
} from "./controllers/usersControllers.js";
import { validateJwtMiddleware } from "./controllers/jwtValidationMiddleware.js";
import {
  addLike,
  addNewComment,
  deleteComment,
  editComment,
  getAllCommentsFromOneMovie,
  getCommentsByUser,
} from "./controllers/commentsController.js";

const router = express.Router();

router.get("/movies", getAllMovies);
router.get("/movie/:movieId", getMovieById);

router.post("/users", createNewUser);
router.post("/login", loginUser);

router.get("/userEmail", validateJwtMiddleware, getUserEmail);
router.post("/userData", getUserDataByEmail)
router.get("/validateToken", validateJwtMiddleware, (req, res) => {
  res.json({ message: "valid" });
});
router.post("/logout", logOut)

router.put("/comments/like/:commentId", addLike)
router.get("/comments/:movieId", getAllCommentsFromOneMovie);
router.post("/userComments", getCommentsByUser)
router.post("/comments/:movieId/new", addNewComment);
router.put("/comments/:movieId/:commentId", editComment)
router.delete("/comments/:movieId/:commentId", deleteComment)

export default router;
