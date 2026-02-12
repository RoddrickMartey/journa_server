import { Router } from "express";
import { postController } from "../controllers/postController";
import { authUserMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create-post", authUserMiddleware, postController.createPost);

router.get(
  "/post-edit/:id",
  authUserMiddleware,
  postController.getPostForEditing,
);

router.post(
  "/post-image-upload",
  authUserMiddleware,
  postController.postUploadImage,
);

router.put(
  "/post-update-details/:postId",
  authUserMiddleware,
  postController.updatePostDetails,
);

// Route to specifically remove the cover image
router.delete(
  "/post-update-details/:postId/cover-image",
  authUserMiddleware,
  postController.removeImage, // or whatever you named the controller method
);

router.put(
  "/post-update-content/:postId",
  authUserMiddleware,
  postController.updatePostContent,
);

router.put(
  "/post-toggle-publishment/:postId",
  authUserMiddleware,
  postController.togglePostPublishment,
);
// router.ts

// Toggle trash/restore
router.put(
  "/post-trash/:postId",
  authUserMiddleware,
  postController.toggleTrashStatus,
);

// Permanent removal
router.delete(
  "/post-permanent/:postId",
  authUserMiddleware,
  postController.permanentDelete,
);

router.get("/mine", authUserMiddleware, postController.getUserPosts);
router.get(
  "/author-view/:slug",
  authUserMiddleware,
  postController.getPostForAuthorView,
);
router.get("/:slug", postController.getPost);

export default router;
