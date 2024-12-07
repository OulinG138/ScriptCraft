import prisma from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

/**
 * @swagger
 * /api/admin/reports/comments:
 *   get:
 *     summary: Retrieve reported comments with unresolved reports
 *     description: Fetches a paginated list of comments that have unresolved reports and includes details of each report and reporter.
 *     tags:
 *       - Admin Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           nullable: true
 *         description: Sort order of report count. If not provided, no specific order is applied.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of combined comments and reporters to retrieve per page.
 *     responses:
 *       200:
 *         description: A list of comments with unresolved reports, limited by the specified count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       isHidden:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       ratingCount:
 *                         type: integer
 *                       reportCount:
 *                         type: integer
 *                       reports:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             reporter:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       403:
 *         description: Unauthorized access.
 *       500:
 *         description: Failed to fetch reported comments.
 */
export default async function handler(req, res) {
  verifyAdmin(req, res, async () => {
    const { sort, page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 5;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const comments = await prisma.comment.findMany({
        where: {
          reportCount: { gt: 0 },
          reports: {
            some: { isResolved: false },
          },
        },
        include: {
          reports: {
            where: { isResolved: false },
            select: {
              id: true,
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        ...(sort && {
          orderBy: { reportCount: sort === "asc" ? "asc" : "desc" },
        }),
      });

      const flattenedReports = [];
      for (const comment of comments) {
        for (const report of comment.reports) {
          flattenedReports.push({
            reportId: report.id,
            reason: report.reason,
            createdAt: report.createdAt,
            reporter: report.reporter,
            relatedCommentId: comment.id,
          });
        }
      }

      const paginatedReports = flattenedReports.slice(skip, skip + pageSize);

      res.status(200).json({
        reports: paginatedReports,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalReports: flattenedReports.length,
      });
    } catch (error) {
      console.error("Failed to fetch reported comments:", error);
      res.status(500).json({ error: "Failed to fetch reported comments" });
    }
  });
}
