import { verifyToken, verifyLoggedIn } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Retrieve paginated replies for a comment
 *     description: This endpoint allows a user or visitor to view a paginated list of replies associated with the specified comment.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to fetch replies for.
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
 *         description: A list of replies for the specified comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                    $ref: '#/components/schemas/Comment'
 *                 totalComments:
 *                   type: integer
 *                 page:
 *                   type: integer
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
  const { commentId } = req.query;

  // Check if comment exists
  const existingComment = await prisma.comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!existingComment) {
    return res.status(404).json({ error: "Comment not found." });
  }

  if (req.method === "GET") {
    try {
      const {page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      verifyLoggedIn(req, res);
      let where;
      if (!req.user) {
        where = {isHidden: false, parentCommentId: Number(commentId)};
      } else {
        where = {
          parentCommentId: Number(commentId),
          OR: [{ isHidden: false }, { authorId: req.user.sub }],
        };
      }

      let results = await prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          ratings: req.user?.sub ? {
            where: {
              userId: req.user?.sub,
            },
          } : false,
        }
      });

      results = results.map(comment => ({
        ...comment,
        ratings: undefined,
        userRating: comment.ratings?.length ? comment.ratings[0] : undefined,
      }));


      results = results.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Apply pagination after sorting
      const paginatedResults = results.slice(skip, skip + limitNum);

      const resultsWithoutRatings = paginatedResults.map((result) => {
        const { ratings, ...resultWithoutRatings } = result;
        return resultWithoutRatings;
      });

      const totalReplies = results.length;

      const response = {
        replies: resultsWithoutRatings,
        totalReplies,
        page: pageNum,
        pagesize: limitNum,
        totalPages: Math.ceil(totalReplies / limitNum),
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
