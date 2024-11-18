import prisma from "@/utils/db";
import { verifyToken } from "@/utils/auth";

/**
 * @swagger
 * /api/user/posts:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
 *     summary: Retrieve a paginated list of posts by the logged-in user.
 *     description: This endpoint allows a user to get a paginated list of posts that they have written.
 *     parameters:
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
 *         description: The number of posts per page. Defaults to 10.
 *     responses:
 *       200:
 *         description: A list of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 totalPosts:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                    type: integer
 *                 totalPages:
 *                   type: integer
 *       405:
 *         description: Method not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { page = 1, limit = 10 } = req.query;

      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);

      try {
        const totalPosts = await prisma.blogPost.count({
          where: { authorId: parseInt(userId) },
        });

        const posts = await prisma.BlogPost.findMany({
          where: { authorId: parseInt(userId) },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        });

        const totalPages = Math.ceil(totalPosts / pageSize);

        return res.status(200).json({
          posts,
          totalPosts,
          page: pageNumber,
          pageSize,
          totalPages,
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
