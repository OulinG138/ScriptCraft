import prisma from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

/**
 * @swagger
 * /api/admin/reports/{id}/hide:
 *   put:
 *     summary: Hide a blog post or comment
 *     description: Sets the `isHidden` status to `true` for a specified blog post or comment, effectively hiding the content.
 *     tags:
 *       - Admin Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the target blog post or comment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [post, comment]
 *                 description: Type of the content to hide.
 *     responses:
 *       200:
 *         description: Content hidden successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Content hidden successfully"
 *       400:
 *         description: Invalid target type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid target type"
 *       403:
 *         description: Unauthorized access.
 *       500:
 *         description: Failed to hide content.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to hide content"
 */

export default async function handler(req, res) {
  const { id } = req.query;

  verifyAdmin(req, res, async () => {
    if (req.method === "PUT") {
      const { targetType } = req.body;

      try {
        const report = await prisma.report.findUnique({
          where: { id: parseInt(id, 10) },
          select:
            targetType === "post" ? { blogPostId: true } : { commentId: true },
        });

        if (!report) {
          return res.status(404).json({ error: "Report not found" });
        }

        if (targetType === "post") {
          await prisma.blogPost.update({
            where: { id: report.blogPostId },
            data: { isHidden: true },
          });
        } else if (targetType === "comment") {
          await prisma.comment.update({
            where: { id: report.commentId },
            data: { isHidden: true },
          });
        } else {
          return res.status(400).json({ error: "Invalid target type" });
        }

        res.status(200).json({ message: "Content hidden successfully" });
      } catch (error) {
        console.error("Error hiding content:", error);
        res.status(500).json({ error: "Failed to hide content" });
      }
    } else {
      res.setHeader("Allow", ["PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
