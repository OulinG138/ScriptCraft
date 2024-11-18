import prisma from "@/utils/db";

/**
 * @swagger
 * /api/comments/{commentId}/ratings:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Retrieve paginated ratings for a specific comment
 *     description: This endpoint allows users and visitors to fetch a paginated list of ratings associated with a specific comment identified by its ID.
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: The ID of the comment to fetch ratings for.
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of ratings per page. Defaults to 10.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A paginated list of ratings for the specified comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *                 totalRatings:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       404:
 *         description: Comment not found.
 *       405:
 *         description: Method not allowed.
 *       500:
 */

export default async function handler(req, res) {
  const { commentId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (req.method === "GET") {
    try {
      // Check if the comment exists
      const comment = await prisma.comment.findUnique({
        where: {
          id: Number(commentId),
        },
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Get the total count of ratings for pagination
      const totalRatings = await prisma.rating.count({
        where: {
          commentId: Number(commentId),
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalRatings / limit);

      // Fetch the ratings with pagination
      const ratings = await prisma.rating.findMany({
        where: {
          commentId: Number(commentId),
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return res.status(200).json({
        ratings,
        totalRatings,
        page,
        pageSize: limit,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
