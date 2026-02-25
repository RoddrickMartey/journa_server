import { Router } from "express";
import { postController } from "../controllers/postController.js";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";
import {
  postCreationLimiter,
  uploadLimiter,
  createUpdateLimiter,
  readLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

// 1. Creation and Management (POST/PUT/DELETE)
// Strict limit on post creation - 10 posts per hour
router.post(
  "/create-post",
  authUserMiddleware,
  postCreationLimiter,
  postController.createPost,
);

// Strict limit on image uploads - 50 per hour
router.post(
  "/post-image-upload",
  authUserMiddleware,
  uploadLimiter,
  postController.postUploadImage,
);

// Update operations - Moderate limit
router.put(
  "/post-update-details/:postId",
  authUserMiddleware,
  createUpdateLimiter,
  postController.updatePostDetails,
);

router.put(
  "/post-update-content/:postId",
  authUserMiddleware,
  createUpdateLimiter,
  postController.updatePostContent,
);

router.put(
  "/post-toggle-publishment/:postId",
  authUserMiddleware,
  createUpdateLimiter,
  postController.togglePostPublishment,
);

router.put(
  "/post-trash/:postId",
  authUserMiddleware,
  createUpdateLimiter,
  postController.toggleTrashStatus,
);

// Delete operations - Moderate limit
router.delete(
  "/post-update-details/:postId/cover-image",
  authUserMiddleware,
  createUpdateLimiter,
  postController.removeImage,
);

router.delete(
  "/post-permanent/:postId",
  authUserMiddleware,
  createUpdateLimiter,
  postController.permanentDelete,
);

// 2. Specialized Fetching (Specific paths) - Read operation, generous limit
router.get(
  "/mine",
  authUserMiddleware,
  readLimiter,
  postController.getUserPosts,
);

router.get(
  "/post-edit/:id",
  authUserMiddleware,
  readLimiter,
  postController.getPostForEditing,
);

router.get(
  "/author-view/:slug",
  authUserMiddleware,
  readLimiter,
  postController.getPostForAuthorView,
);

// 3. View Logic (The specific increment route) - Generous limit for views
router.post(
  "/:slug/view",
  authUserMiddleware,
  readLimiter,
  postController.incrementView,
);

// 4. Public/Main Fetch (Generic slug at the very bottom) - Read operation, generous limit
router.get("/:slug", authUserMiddleware, readLimiter, postController.getPost);

export default router;
