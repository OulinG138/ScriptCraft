import prisma from "@/middleware/reportCountMiddleware";
import { verifyToken } from "@/utils/auth";

/**
 * @swagger
 * /api/reports:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Create a report for a post or comment
 *     description: This endpoint allows a user to create a report for a post or a comment with an explanation.
 *     security:
 *       - bearerAuth: []
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
 *                   - post
 *                   - comment
 *                 description: The type of target for the report (either "post" or "comment").
 *                 example: "post"
 *               targetId:
 *                 type: integer
 *                 description: The ID of the post or comment being reported.
 *                 example: 1
 *               explanation:
 *                 type: string
 *                 description: Explanation for the report.
 *     responses:
 *       201:
 *         description: Report created successfully.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: Target not found.
 *       405:
 *         description: Method not allowed.
 *       500:
 */

export default async function handler(req, res) {
  if (req.method === "POST") {
    verifyToken(req, res, async () => {
      const userId = req.user.sub;
      const { targetType, targetId, explanation } = req.body;

      // Validate inputs
      if (targetType !== "comment" && targetType !== "post") {
        return res.status(400).json({ error: "Invalid target type." });
      }

      if (!explanation || explanation.trim() === "") {
        return res.status(400).json({ error: "Explanation cannot be empty." });
      }

      try {
        // Check if targetId is valid based on targetType
        let isValidTarget = false;

        if (targetType === "comment") {
          const comment = await prisma.comment.findUnique({
            where: { id: targetId },
          });
          isValidTarget = !!comment; // Check if comment exists
        } else if (targetType === "post") {
          const blogPost = await prisma.blogPost.findUnique({
            where: { id: targetId },
          });
          isValidTarget = !!blogPost; // Check if blog post exists
        }

        if (!isValidTarget) {
          return res.status(404).json({ error: "Target not found." });
        }

        // Proceed to create the report
        const report = await prisma.report.create({
          data: {
            reporterId: userId,
            explanation,
            ...(targetType === "comment"
              ? { commentId: targetId }
              : { blogPostId: targetId }),
            targetType,
          },
        });

        return res.status(201).json(report);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } else {
    return res.status(405).json(`Method ${req.method} Not Allowed`);
  }
}
