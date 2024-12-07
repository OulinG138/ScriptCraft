import { verifyToken } from "@/utils/auth";
import prisma from "@/middleware/ratingCountMiddleware";

/**
 * @swagger
 * /api/ratings/{ratingId}:
 *   delete:
 *     summary: Delete a rating by ID
 *     description: This endpoint allows users to delete a rating that they have previously left on a post or comment.
 *     tags:
 *       - Ratings
 *     parameters:
 *       - name: ratingId
 *         in: path
 *         required: true
 *         description: ID of the rating to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized to delete this rating
 *       404:
 *         description: Rating not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { ratingId } = req.query;

      try {
        const existingRating = await prisma.rating.findUnique({
          where: { id: Number(ratingId) },
        });

        if (!existingRating) {
          return res.status(404).json({ error: "Rating not found" });
        }

        if (existingRating.userId !== userId) {
          return res
            .status(403)
            .json({ error: "Unauthorized to delete this rating" });
        }

        await prisma.rating.delete({
          where: { id: Number(ratingId) },
        });

        return res.status(200).json({ message: "Rating successfully deleted" });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
      }
    });
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
