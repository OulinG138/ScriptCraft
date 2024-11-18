import prisma from "@/utils/db";

/**
 * @swagger
 * /api/posts/{postId}/ratings:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Retrieve paginated ratings for a specific post
 *     description: This endpoint allows users and visitors to fetch a paginated list of ratings associated with a specific post identified by its ID.
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post to fetch ratings for.
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: The number of ratings per page. Defaults to 10.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A paginated list of ratings for the specified post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/Rating'
 *                 totalRatings:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 *       405:
 *         description: Method not allowed.
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    const postId = parseInt(req.query.postId);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      // Verify if postId is a valid blog post
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Retrieve paginated ratings if blog post exists
      const ratings = await prisma.rating.findMany({
        where: { blogPostId: postId },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      // Get total count of ratings for the blog post for pagination info
      const totalRatings = await prisma.rating.count({
        where: { blogPostId: postId },
      });

      res.status(200).json({
        ratings,
        totalRatings,
        page,
        pageSize,
        totalPages: Math.ceil(totalRatings / pageSize),
      });
    } catch (error) {
      console.error("Error retrieving ratings:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
