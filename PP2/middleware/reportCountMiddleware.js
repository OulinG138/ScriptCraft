import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaInternal = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model === "Report") {
    const { action, args } = params;

    if (action === "create") {
      const result = await next(params);

      if (args.data.targetType === "post" && result.blogPostId) {
        console.log(
          "Incrementing report_count for BlogPost ID:",
          result.blogPostId
        );
        await prismaInternal.blogPost.update({
          where: { id: result.blogPostId },
          data: {
            reportCount: { increment: 1 },
          },
        });
      } else if (args.data.targetType === "comment" && result.commentId) {
        console.log(
          "Incrementing report_count for Comment ID:",
          result.commentId
        );
        await prismaInternal.comment.update({
          where: { id: result.commentId },
          data: {
            reportCount: { increment: 1 },
          },
        });
      }

      return result;
    }

    if (action === "update" && args.data.isResolved === true) {
      const report = await prisma.report.findUnique({
        where: { id: args.where.id },
        select: {
          blogPostId: true,
          commentId: true,
          targetType: true,
          isResolved: true,
        },
      });
      console.log("Report found for resolve update:", report);

      const result = await next(params);

      if (report && !report.isResolved) {
        if (report.targetType === "post" && report.blogPostId) {
          console.log(
            "Decrementing report_count for BlogPost ID:",
            report.blogPostId
          );
          await prismaInternal.blogPost.update({
            where: { id: report.blogPostId },
            data: {
              reportCount: { decrement: 1 },
            },
          });
        } else if (report.targetType === "comment" && report.commentId) {
          console.log(
            "Decrementing report_count for Comment ID:",
            report.commentId
          );
          await prismaInternal.comment.update({
            where: { id: report.commentId },
            data: {
              reportCount: { decrement: 1 },
            },
          });
        }
      }

      return result;
    }
  }

  return next(params);
});

export default prisma;
