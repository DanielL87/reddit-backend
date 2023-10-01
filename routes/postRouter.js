import { prisma } from "../index.js";
import express from "express";

export const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        subreddit: true,
        children: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        downvotes: true,
        upvotes: true,
      },
    });
    return res.send({
      success: true,
      posts,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

postRouter.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { children: true },
    });

    res.send({ success: true, post });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

postRouter.post("/", async (req, res) => {
  try {
    const { text, title, subredditId, parentId } = req.body;

    if (!text || !subredditId) {
      return res.send({
        success: false,
        error:
          "Please include text, title and subredditId name when creating a summary",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to create a submission.",
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        text,
        userId: req.user.id,
        username: req.username,
        subredditId,
        parentId,
      },
    });

    res.send({ success: true, post });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to delete.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    if (userId !== post.userId) {
      return res.send({
        success: false,
        error: "You must be the owner of this post to delete!",
      });
    }

    post = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.send({ success: true, post });
  } catch (error) {
    res.send({ error: error.message });
  }
});

postRouter.put("/:postId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { text, title } = req.body;

    if (!text && !title) {
      return res.send({
        success: false,
        error: "Please provide a title and/or text to update!",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to delete.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    if (userId !== post.userId) {
      return res.send({
        success: false,
        error: "You must be the owner of this post to delete!",
      });
    }
    post = await prisma.post.update({
      where: { id: postId },
      data: { title, text },
    });
    res.send({ success: true, post });
  } catch (error) {
    res.send({ sucess: false, error: error.message });
  }
});
