import { prisma } from "../index.js";
import express from "express";

export const voteRouter = express.Router();

voteRouter.post("/upvotes/:postId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to upvote.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    //checks if uswr has already upvoted
    let upvote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (upvote) {
      return res.send({
        sucess: false,
        error: "You've already upvoted!",
      });
    }

    //deletes downvote at same time user upvotes
    const foundDownvote = await prisma.downvote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (foundDownvote) {
      const deleteDownvote = await prisma.downvote.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    }

    upvote = await prisma.upvote.create({
      data: { userId, postId },
    });

    res.send({ success: true, upvote });
  } catch (error) {
    res.send({ sucess: false, error: error.message });
  }
});

voteRouter.delete("/upvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    const upvote = await prisma.upvote.delete({
      where: {
        userId_postId: { userId: req.user.id, postId },
      },
    });

    res.send({ success: true, upvote });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

voteRouter.post("/downvotes/:postId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to downvote.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    let downvote = await prisma.downvote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (downvote) {
      return res.send({
        sucess: false,
        error: "You've already downvoted!",
      });
    }

    //deletes downvote at same time user upvotes
    const foundUpvote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (foundUpvote) {
      const deleteUpvote = await prisma.upvote.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    }

    downvote = await prisma.downvote.create({
      data: { userId, postId },
    });

    res.send({ success: true, downvote });
  } catch (error) {
    res.send({ sucess: false, error: error.message });
  }
});

voteRouter.delete("/downvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login.",
      });
    }
    //Checks if post Exists
    let post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({ success: false, error: "Post doesn't exist" });
    }

    const downvote = await prisma.downvote.delete({
      where: {
        userId_postId: { userId: req.user.id, postId },
      },
    });

    res.send({ success: true, downvote });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});
