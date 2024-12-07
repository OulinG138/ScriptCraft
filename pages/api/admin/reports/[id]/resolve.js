import prisma from "@/middleware/reportCountMiddleware";
import { verifyAdmin } from "@/utils/auth";

/**
 * @swagger
 * /api/admin/reports/{id}/resolve:
 *   put:
 *     summary: Mark a report as resolved
 *     description: Updates the `isResolved` status of a specific report to `true`, indicating that the report has been reviewed and resolved.
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
 *         description: The ID of the report to mark as resolved.
 *     responses:
 *       200:
 *         description: Report marked as resolved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report marked as resolved"
 *       404:
 *         description: Report not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Report not found"
 *       403:
 *         description: Unauthorized access.
 *       500:
 *         description: Server error - failed to mark report as resolved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to mark report as resolved"
 */

export default async function handler(req, res) {
  const { id } = req.query;

  verifyAdmin(req, res, async () => {
    if (req.method === "PUT") {
      try {
        const updatedReport = await prisma.report.update({
          where: { id: parseInt(id, 10) },
          data: { isResolved: true },
        });

        res.status(200).json({ message: "Report marked as resolved" });
      } catch (error) {
        console.error("Error marking report as resolved:", error);
        res.status(500).json({ error: "Failed to mark report as resolved" });
      }
    } else {
      res.setHeader("Allow", ["PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
