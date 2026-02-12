import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createPostSchema,
  editorContentSchema,
  postImageUploadSchema,
  updatePostSchema,
} from "../validation/postValidation";
import { postService } from "../services/postService";

class PostController {
  createPost = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const payload = createPostSchema.parse(req.body);
    const result = await postService.createPast(payload, userId);
    return res.status(201).json(result);
  });
  updatePostDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;

    // Zod validates and strips any extra fields not in the schema
    const payload = updatePostSchema.parse(req.body);
    const { postId } = req.params as { postId: string };

    // Pass everything to the service
    const result = await postService.updatePost(postId, payload, userId);

    // Status 200 is more appropriate for an update
    return res.status(200).json({
      message: "Post updated successfully",
      ...result,
    });
  });

  removeImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    await postService.removePostCoverImage(postId, userId);

    return res.status(200).json({ message: "Cover image removed" });
  });

  getPostForEditing = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { id } = req.params as { id: string };
    const result = await postService.getPostForEditing(id, userId);
    return res.status(200).json(result);
  });

  getPost = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const result = await postService.getPost(slug);
    return res.status(200).json(result);
  });

  getPostForAuthorView = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const userId = req.auth!.id;
    const result = await postService.getPostForAuthorView(slug, userId);
    return res.status(200).json(result);
  });

  postUploadImage = asyncHandler(async (req: Request, res: Response) => {
    const payload = postImageUploadSchema.parse(req.body);
    const result = await postService.uploadPostImage(payload.imageBase64);
    return res.status(201).json(result);
  });

  getUserPosts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const result = await postService.getUserPosts(userId);
    return res.status(200).json(result);
  });

  updatePostContent = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };
    const content = editorContentSchema.parse(req.body);
    const result = await postService.updateContent(content, postId, userId);
    return res.status(200).json(result);
  });

  togglePostPublishment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };
    await postService.togglePostPublishment(postId, userId);
    return res.status(200).json({ success: true });
  });

  // post.controller.ts

  toggleTrashStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    const post = await postService.toggleTrashStatus(postId, userId);

    return res.status(200).json({
      success: true,
      isDeleted: post.isDeleted,
      message: post.isDeleted ? "Moved to trash" : "Restored to drafts",
    });
  });

  permanentDelete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    await postService.permanentDelete(postId, userId);

    return res.status(200).json({
      success: true,
      message: "Post permanently deleted",
    });
  });
}

export const postController = new PostController();
