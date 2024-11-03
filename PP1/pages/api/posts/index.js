import { verifyToken, verifyLoggedIn } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/posts:
 *
 *   post:
 *     summary: Create a new post
 *     description: This endpoint allows a user to create a new post with a title, description, content, tags, and links to code templates.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               codeTemplateIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1
 *     responses:
 *       200:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: An error occurred while creating the rating.
 *
 *   get:
 *     summary: Retrieve a paginated list of posts
 *     description: This endpoint allows a user or visitor to retreive a paginated list of posts.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Posts
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
  if (req.method === "POST") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { title, description, content, tags, codeTemplateIds } = req.body;

      // Validate non-empty fields
      if (
        !title ||
        !description ||
        !content ||
        (tags && tags.some((tag) => tag.trim() === ""))
      ) {
        return res.status(400).json({
          error: "Title, description, content, and tags cannot be empty",
        });
      }

      try {
        // Validate codeTemplateIds
        if (codeTemplateIds && codeTemplateIds.length > 0) {
          const validTemplates = await prisma.CodeTemplate.findMany({
            where: {
              id: { in: codeTemplateIds },
            },
            select: { id: true },
          });

          const validTemplateIds = validTemplates.map(
            (template) => template.id
          );

          // Check if any provided ID is invalid
          const invalidCodeTemplateIds = codeTemplateIds.filter(
            (id) => !validTemplateIds.includes(id)
          );
          if (invalidCodeTemplateIds.length > 0) {
            return res.status(400).json({ error: "Invalid code template IDs" });
          }
        }

        const blogPost = await prisma.BlogPost.create({
          data: {
            authorId: userId,
            title,
            description,
            content,
            // Connect or create tags if provided
            tags:
              tags && tags.length > 0
                ? {
                    connectOrCreate: tags.map((tagName) => ({
                      where: { name: tagName },
                      create: { name: tagName },
                    })),
                  }
                : undefined,
            // Connect code templates if provided
            codeTemplates:
              codeTemplateIds && codeTemplateIds.length > 0
                ? {
                    connect: codeTemplateIds.map((id) => ({ id })),
                  }
                : undefined,
          },
        });

        return res.status(200).json(blogPost);
      } catch (error) {
        console.error("Error during blog post creation:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  } else if (req.method === "GET") {
    try {
      const {
        search,
        sortBy = "ratings",
        page = 1,
        limit = 10,
        codeTemplateId,
        searchTags,
      } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      verifyLoggedIn(req, res);
      let where;
      if (!req.user) {
        where = { isHidden: false };
      } else {
        where = {
          OR: [{ isHidden: false }, { authorId: req.user.sub }],
        };
      }

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

      // Add filter for codeTemplateId if it exists
      if (codeTemplateId) {
        if (!where.AND) where.AND = [];
        where.AND.push({
          codeTemplates: {
            some: {
              id: Number(codeTemplateId),
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
        if (!where.AND) where.AND = [];
        where.AND.push({
          AND: tags.map((tag) => ({
            tags: {
              some: {
                name: tag,
              },
            },
          })),
        });
      }

      // Fetch results from the database based on the 'where' condition
      let results = await prisma.blogPost.findMany({
        where,
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
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
