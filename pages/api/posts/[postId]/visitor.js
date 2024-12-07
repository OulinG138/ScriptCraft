import prisma from "@/utils/db";

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
      const post = await prisma.BlogPost.findUnique({
        where: { id: Number(postId) },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          tags: true,
          codeTemplates: true
        }
      });


      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.isHidden) {
        return res.status(403).json({ error: "Unauthorized to view this post" });
      }

      return res.status(200).json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
