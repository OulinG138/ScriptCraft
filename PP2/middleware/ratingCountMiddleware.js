import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaInternal = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model === "Rating") {
    const { action, args } = params;

    if (action === "create") {
      const result = await next(params);

      if (args.data.targetType === "post" && result.blogPostId) {
        await prismaInternal.blogPost.update({
          where: { id: result.blogPostId },
          data: {
            ratingCount:
              result.value === 1 ? { increment: 1 } : { decrement: 1 },
          },
        });
      } else if (args.data.targetType === "comment" && result.commentId) {
        await prismaInternal.comment.update({
          where: { id: result.commentId },
          data: {
            ratingCount:
              result.value === 1 ? { increment: 1 } : { decrement: 1 },
          },
        });
      }

      return result;
    }

    if (action === "delete") {
      const rating = await prisma.rating.findUnique({
        where: { id: args.where.id },
        select: {
          blogPostId: true,
          commentId: true,
          value: true,
          targetType: true,
        },
      });

      const result = await next(params);

      if (rating?.targetType === "post" && rating.blogPostId) {
        await prismaInternal.blogPost.update({
          where: { id: rating.blogPostId },
          data: {
            ratingCount:
              rating.value === 1 ? { decrement: 1 } : { increment: 1 },
          },
        });
      } else if (rating?.targetType === "comment" && rating.commentId) {
        await prismaInternal.comment.update({
          where: { id: rating.commentId },
          data: {
            ratingCount:
              rating.value === 1 ? { decrement: 1 } : { increment: 1 },
          },
        });
      }

      return result;
    }
  }

  return next(params);
});

export default prisma;
