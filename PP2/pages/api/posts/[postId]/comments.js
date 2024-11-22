import { verifyToken, verifyLoggedIn } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment or reply
 *     description: This endpoint allows a user to write new comment to the specified post. Optionally, the comment can be a reply to an existing comment.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to leave the comment on.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               parentCommentId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing or invalid request parameters.
 *       404:
 *         description: Post not found.
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Internal Server Error.
 *
 *   get:
 *     summary: Retrieve paginated comments for a post
 *     description: This endpoint allows a user or visitor to view a paginated list of comments associated with the specified post.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to fetch comments for.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ratings, date]
 *         description: The options to sort by. Defaults to ratings.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: The page number for pagination. Defaults to 1.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: The number of comments per page. Defaults to 10.
 *     responses:
 *       200:
 *         description: A list of comments for the specified post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                    $ref: '#/components/schemas/Comment'
 *                 totalComments:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                   example: 3
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       404:
 *         description: Post not found.
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Internal Server Error.
 */

export default async function handler(req, res) {
  const { postId } = req.query;

  // Check if postId exists
  const postExists = await prisma.blogPost.findUnique({
    where: { id: Number(postId) },
  });

  if (!postExists) {
    return res.status(404).json({ error: "Post not found." });
  }

  if (req.method === "POST") {
    verifyToken(req, res, async () => {
      const { content, parentCommentId } = req.body;
      const userId = req.user.sub;

      // Check if content is an empty string
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Content cannot be empty." });
      }

      try {
        // Check if parentCommentId exists in the database if provided
        if (parentCommentId) {
          const parentComment = await prisma.comment.findUnique({
            where: { id: Number(parentCommentId) },
          });

          if (!parentComment) {
            return res.status(404).json({ error: "Parent comment not found." });
          }

          // Check if the postId of the parent comment matches the current postId
          if (parentComment.postId !== Number(postId)) {
            return res
              .status(400)
              .json({ error: "Parent comment does not belong to this post." });
          }
        }

        const newComment = await prisma.comment.create({
          data: {
            content,
            post: {
              connect: { id: Number(postId) },
            },
            author: {
              connect: { id: userId },
            },
            ...(parentCommentId && {
              parentComment: { connect: { id: parentCommentId } },
            }),
          },
        });

        res.status(201).json(newComment);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } else if (req.method === "GET") {
    try {
      const { sortBy = "ratings", page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      verifyLoggedIn(req, res);
      let where;
      if (!req.user) {
        where = { postId: Number(postId), isHidden: false, parentCommentId: null};
      } else {
        where = {
          postId: Number(postId),
          OR: [{ isHidden: false }, { authorId: req.user.sub }],
        };
      }

      let results = await prisma.comment.findMany({
        where,
        include: {
          author: true,
          replies: true,
          ratings: req.user?.sub ? {
            where: {
              userId: req.user?.sub,
            },
          } : false,
        },
      });
                
      results = results.map(comment => ({
        ...comment,
        repliesCount: comment.replies.length,
        replies: undefined,
        ratings: undefined,
        userRating: comment.ratings?.length ? comment.ratings[0] : undefined,
      }));

      // Sort results based on the 'sortBy' parameter or createdAt date
      if (sortBy === "ratings") {
        results = results.sort((a, b) => {
          const aRatingCount = a.ratingCount;
          const bRatingCount = b.ratingCount;
          return bRatingCount - aRatingCount;
        });
      } else {
        results = results.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      // Apply pagination after sorting
      const paginatedResults = results.slice(skip, skip + limitNum);

      const resultsWithoutRatings = paginatedResults.map((result) => {
        const { ratings, ...resultWithoutRatings } = result;
        return resultWithoutRatings;
      });

      const totalComments = results.length;

      const response = {
        comments: resultsWithoutRatings,
        totalComments,
        page: pageNum,
        pagesize: limitNum,
        totalPages: Math.ceil(totalComments / limitNum),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
