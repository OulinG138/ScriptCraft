import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {
        title,
        content,
        codeTemplate,
        sortBy = "ratings",
        page = 1,
        limit = 10,
        searchTags,
      } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      let where = { isHidden: false };

      const additionalFilters = [];

      if (title) {
        additionalFilters.push({ title: { contains: title.toLowerCase() } });
      }
    
      if (content) {
        additionalFilters.push({ content: { contains: content.toLowerCase() } });
      }
    
      if (codeTemplate) {
        additionalFilters.push({
          codeTemplates: {
            some: {
              OR: [
                { title: { contains: codeTemplate.toLowerCase() } },
                { codeContent: { contains: codeTemplate.toLowerCase() } },
                { explanation: { contains: codeTemplate.toLowerCase() } },
                { language: { contains: codeTemplate.toLowerCase() } },
              ],
            },
          },
        });
      }

      // Add filter for tags if it exists
      if (searchTags) {
        const tags = searchTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      
          additionalFilters.push({
          AND: tags.map((tag) => ({
            tags: {
              some: {
                name: {
                  equals: tag.toLowerCase(),
                },
              },
            },
          })),
        });
      }

      if (additionalFilters.length > 0) {
        where = {
          AND: [where, ...additionalFilters],
        };
      }
      
      // Fetch results from the database based on the 'where' condition
      let results = await prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          }
        }
      });

      // Sort results based on the 'sortBy' parameter or createdAt date
      if (sortBy === "ratings") {
        results = results.sort((a, b) => {
          const aRatingCount = a.ratingCount;
          const bRatingCount = b.ratingCount;
          return bRatingCount - aRatingCount;
        });
      } else {
        results = results.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      // Apply pagination after sorting
      const paginatedResults = results.slice(skip, skip + limitNum);

      const resultsWithoutRatings = paginatedResults.map((result) => {
        const { ratings, ...resultWithoutRatings } = result;
        return resultWithoutRatings;
      });

      const totalPosts = results.length;

      const response = {
        posts: resultsWithoutRatings,
        totalPosts,
        page: pageNum,
        pagesize: limitNum,
        totalPages: Math.ceil(totalPosts / limitNum),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
