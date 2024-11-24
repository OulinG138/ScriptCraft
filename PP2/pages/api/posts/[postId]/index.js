import prisma from "@/utils/db";
import { verifyLoggedIn, verifyToken } from "@/utils/auth";

/**
 * @swagger
 * /api/posts/{postId}:
 *   get:
 *     summary: Retrieve a post by ID
 *     description: This endpoint allows a user or visitor to view the contents of a post specified by ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the blog post
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Post'
 *       403:
 *         description: Not authroized
 *       404:
 *         description: Post not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a post by ID
 *     description: This endpoint allows a user to edit a post that they have written, given its ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post to update.
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Successfully updated the blog post
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request, validation error
 *       403:
 *         description: Unauthorized to update this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a post by ID
 *     description: This endpoint allows a user to delete a post that they have written, given its ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized to delete this post
 *       404:
 *         description: Post not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { postId } = req.query;

    try {
      let where = { id: Number(postId) };
      verifyLoggedIn(req, res);
      if (!req.user) {
        where.isHidden = false;
      } else {
        where = {
          ...where,
          OR: [{ isHidden: false }, { authorId: req.user.sub }],
        };
      }
      
      let post = await prisma.BlogPost.findUnique({
        where,
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          tags: true,
          codeTemplates: true,
          ratings: req.user?.sub ? {
            where: {
              userId: req.user?.sub,
            },
          } : false,
        },
      });      
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.isHidden) {
        verifyLoggedIn(req);
        if (!req.user || req.userId != post.authorId) {
          return res
            .status(403)
            .json({ error: "Unauthorized to view this post" });
        }
      }

      if (post.ratings && post.ratings.length > 0) {
        post.userRating = post.ratings[0];
      }

      post.ratings = undefined;
      
      return res.status(200).json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "PUT") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { postId } = req.query;
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
        // Validate post and user
        const existingPost = await prisma.BlogPost.findUnique({
          where: { id: Number(postId) },
        });

        if (!existingPost) {
          return res.status(404).json({ error: "Post not found" });
        }

        if (existingPost.authorId !== userId) {
          return res
            .status(403)
            .json({ error: "Unauthorized to update this post" });
        }

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

        // Update the blog post
        const updatedPost = await prisma.BlogPost.update({
          where: { id: Number(postId) },
          data: {
            title,
            description,
            content,
            tags:
            tags && tags.length > 0
              ? {
                  // Disconnect all existing tags
                  disconnect: await prisma.blogPost
                    .findUnique({
                      where: { id: Number(postId) },
                      select: { tags: { select: { id: true } } }, // Select the IDs of existing tags
                    })
                    .then((post) => post?.tags.map((tag) => ({ id: tag.id }))),
                  connectOrCreate: tags.map((tagName) => ({
                    where: { name: tagName },
                    create: { name: tagName },
                  })),
                }
              : {
                  // Disconnect all existing tags if no new tags are provided
                  disconnect: await prisma.blogPost
                    .findUnique({
                      where: { id: Number(postId) },
                      select: { tags: { select: { id: true } } }, // Select the IDs of existing tags
                    })
                    .then((post) => post?.tags.map((tag) => ({ id: tag.id }))),
                },
          codeTemplates:
            codeTemplateIds && codeTemplateIds.length > 0
              ? {
                  // Disconnect all existing code templates
                  disconnect: await prisma.blogPost
                    .findUnique({
                      where: { id: Number(postId) },
                      select: { codeTemplates: { select: { id: true } } }, // Select the IDs of existing code templates
                    })
                    .then((post) => post?.codeTemplates.map((template) => ({ id: template.id }))),
                  connect: codeTemplateIds.map((id) => ({ id })),
                }
              : {
                  // Disconnect all existing code templates if no new ids are provided
                  disconnect: await prisma.blogPost
                    .findUnique({
                      where: { id: Number(postId) },
                      select: { codeTemplates: { select: { id: true } } }, // Select the IDs of existing code templates
                    })
                    .then((post) => post?.codeTemplates.map((template) => ({ id: template.id }))),
                },
        },
      });
        return res.status(200).json(updatedPost);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  } else if (req.method === "DELETE") {
    verifyToken(req, res, async () => {
      const userId = req.userId;
      const { postId } = req.query;

      try {
        const existingPost = await prisma.BlogPost.findUnique({
          where: { id: Number(postId) },
        });

        if (!existingPost) {
          return res.status(404).json({ error: "Post not found" });
        }

        if (existingPost.authorId !== userId) {
          return res
            .status(403)
            .json({ error: "Unauthorized to delete this post" });
        }

        await prisma.blogPost.delete({
          where: { id: Number(postId) },
        });

        return res.status(200).json({ message: "Post successfully deleted" });
      } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
