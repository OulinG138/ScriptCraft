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
    try {
      const {
        title,
        content,
        codeTemplate,
        sortBy = "ratings",
        page = 1,
        limit = 10,
        searchTags,
      } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      let where = { authorId: req.user.sub };

      const additionalFilters = [];

      if (title) {
        additionalFilters.push({ title: { contains: title.toLowerCase() } });
      }
    
      if (content) {
        additionalFilters.push({ content: { contains: content.toLowerCase() } });
      }
    
      if (codeTemplate) {
        additionalFilters.push({
          codeTemplates: {
            some: {
              OR: [
                { title: { contains: codeTemplate.toLowerCase() } },
                { codeContent: { contains: codeTemplate.toLowerCase() } },
                { explanation: { contains: codeTemplate.toLowerCase() } },
                { language: { contains: codeTemplate.toLowerCase() } },
              ],
            },
          },
        });
      }

      // Add filter for tags if it exists
      if (searchTags) {
        const tags = searchTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      
          additionalFilters.push({
          AND: tags.map((tag) => ({
            tags: {
              some: {
                name: {
                  equals: tag.toLowerCase(),
                },
              },
            },
          })),
        });
      }

      if (additionalFilters.length > 0) {
        where = {
          AND: [where, ...additionalFilters],
        };
      }
      
      // Fetch results from the database based on the 'where' condition
      let results = await prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          }
        }
      });

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

      const totalPosts = results.length;

      const response = {
        posts: resultsWithoutRatings,
        totalPosts,
        page: pageNum,
        pagesize: limitNum,
        totalPages: Math.ceil(totalPosts / limitNum),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    })
  }  else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
