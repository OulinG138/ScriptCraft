import prisma from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: Retrieve report details
 *     description: Fetches details of a specific report, including information about the reporter, and either related blog post or comment based on targetType.
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
 *         description: The ID of the report to retrieve.
 *     responses:
 *       200:
 *         description: Details of the specified report.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the report
 *                 explanation:
 *                   type: string
 *                   description: Explanation of the report
 *                 targetType:
 *                   type: string
 *                   enum: [post, comment]
 *                   description: Indicates if the report is related to a blog post or a comment
 *                 reporter:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                 post:
 *                   type: object
 *                   nullable: true
 *                   description: Included if targetType is "post"
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     content:
 *                       type: string
 *                 comment:
 *                   type: object
 *                   nullable: true
 *                   description: Included if targetType is "comment"
 *                   properties:
 *                     id:
 *                       type: integer
 *                     content:
 *                       type: string
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
 *         description: Server error - failed to fetch report details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch report details"
 */
export default async function handler(req, res) {
  verifyAdmin(req, res, async () => {
    const { id } = req.query;

    if (req.method === "GET") {
      try {
        const basicReport = await prisma.report.findUnique({
          where: { id: parseInt(id, 10) },
          select: {
            id: true,
            explanation: true,
            targetType: true,
            reporter: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        });

        if (!basicReport) {
          return res.status(404).json({ error: "Report not found" });
        }

        const additionalData =
          basicReport.targetType === "post"
            ? await prisma.blogPost.findUnique({
                where: { id: basicReport.id },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  content: true,
                },
              })
            : await prisma.comment.findUnique({
                where: { id: basicReport.id },
                select: { id: true, content: true },
              });

        const report = {
          ...basicReport,
          [basicReport.targetType]: additionalData || null,
        };

        res.status(200).json(report);
      } catch (error) {
        console.error("Error fetching report details:", error);
        res.status(500).json({ error: "Failed to fetch report details" });
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
