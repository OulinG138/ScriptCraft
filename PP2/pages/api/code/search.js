
import { verifyLoggedIn } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/code/search:
 *   get:
 *     summary: Retrieve a paginated list of posts
 *     description: This endpoint allows a user or visitor to retreive a paginated list of posts.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Code
 *     parameters:
 *       - in: query
 *         name: search
 *         description: A string of keywords to search for.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchTags
 *         description: A comma-separated list of tags to filter by.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         description: The options to sort by. Defaults to ratings.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ratings, date]
 *       - in: query
 *         name: codeTemplateId
 *         description: A code template ID to filter by.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of posts per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/Post'
 *                 totalPosts:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Internal server error.
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        searchTags,
      } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      let where = {};
      // Add filters based on the search query if it exists
      if (search) {
        where.OR = [
          { title: { contains: search.toLowerCase() } },
          { content: { contains: search.toLowerCase() } },
          {
            codeTemplates: {
              some: {
                title: { contains: search.toLowerCase() },
              },
            },
          },
        ];
      }

      // Add filter for tags if it exists
      if (searchTags) {
        const tags = searchTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      
        if (!where.AND) where.AND = [];
        where.AND.push({
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

      // Fetch results from the database based on the 'where' condition
      let results = await prisma.codeTemplate.findMany({
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

      // Apply pagination after sorting
      const paginatedResults = results.slice(skip, skip + limitNum);

      const resultsWithoutRatings = paginatedResults.map((result) => {
        const { ratings, ...resultWithoutRatings } = result;
        return resultWithoutRatings;
      });

      const totalPosts = results.length;

      const response = {
        templates: resultsWithoutRatings,
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
  }
}

