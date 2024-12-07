import prisma from "@/middleware/ratingCountMiddleware";
import { verifyToken } from "@/utils/auth";

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Ratings
 *     summary: Create a rating for a post or comment
 *     description: This endpoint allows users to create a rating by providing the target type (post or comment), target ID, and the rating value (0 for downvote, 1 for upvote).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum:
 *                   - comment
 *                   - post
 *                 example: "post"
 *               targetId:
 *                 type: integer
 *                 example: 1
 *               value:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Rating created successfully.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: The specified target was not found.
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Internal server error.
 */

export default async function handler(req, res) {
  if (req.method === "POST") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { targetType, targetId, value } = req.body;

      // Validate rating value is either 0 or 1
      if (value !== 0 && value !== 1) {
        return res.status(400).json({ error: "Value must be either 0 or 1." });
      }

      // Validate targetType
      if (targetType !== "post" && targetType !== "comment") {
        return res.status(400).json({ error: "Invalid target type." });
      }

      try {
        // Validate targetId based on targetType
        let targetExists = false;
        if (targetType === "comment") {
          targetExists = await prisma.comment.findUnique({
            where: { id: targetId },
          });
        } else if (targetType === "post") {
          targetExists = await prisma.blogPost.findUnique({
            where: { id: targetId },
          });
        }

        if (!targetExists) {
          return res
            .status(404)
            .json({ error: `No ${targetType} found with the given ID.` });
        }

        // Create rating
        const rating = await prisma.rating.create({
          data: {
            value,
            user: { connect: { id: userId } },
            ...(targetType === "comment"
              ? { comment: { connect: { id: targetId } } }
              : { blogPost: { connect: { id: targetId } } }),
            targetType,
          },
        });

        res.status(201).json(rating);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
