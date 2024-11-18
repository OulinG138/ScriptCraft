// Use two methods for forking and editing
import { PrismaClient } from "@prisma/client";

/**
 * @swagger
 * /api/code/search:
 *   get:
 *     summary: Searches code templates
 *     description: Allows users to get a list of all code templates satifying certain filters
 *     tags:
 *       - Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pageSize
 *               - pageNumber
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the requested code template
 *                 example: Hello World
 *               explanation:
 *                 type: string
 *                 description: A description of what the code template does
 *                 example: Prints "Hello World"
 *               language:
 *                 type: string
 *                 description: The coding language the code template is in
 *                 example: python
 *               tags:
 *                 type: array
 *                 description: A list of tags to give to the code template
 *                 example: ["basic"]
 *               pageSize:
 *                 type: int
 *                 description: The number of templates to return
 *                 example: 20
 *               pageNumber:
 *                 type: int
 *                 description: From all possible results, returns the pageNumber-th set of pageSize results (1 indexed)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Fetch successful, returns paginated results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fetch successful"
 *                 result:
 *                   type: array
 *                   items:
 *                      type: object
 *                   example:
 *                      - title:
 *                          type: string
 *                          example: Hello World
 *                        explanation:
 *                          type: string
 *                          example: Prints "Hello World"
 *                        codeContent:
 *                          type: string
 *                          example: print("Hello World")
 *                        language:
 *                          type: string
 *                          example: python
 *                        authorId:
 *                          type: int
 *                          example: 1
 *                        parentTemplateId:
 *                          type: int | null
 *                          example: 1
 *                        tags:
 *                          type: array
 *                          example:
 *                             - id: 1
 *                               name: "tag"
 *
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template Fetch Failed
 */

const prisma = new PrismaClient();

/**
 * Implemented User Stories:
 *
 * As a user, I want to view and search through my list of my saved templates,
 * including their titles, explanations, and tags, so that I can easily find and reuse them.
 *  - Make a GET request satisfying above swagger docs with the requested authorID and other applicable filters.
 *    Assume that pageSize and pageNumber are present, of the valid type, and both > 0.
 *
 * As a visitor, I want to search through all available templates by title, tags, or content so that I can quickly
 * find relevant code for my needs.
 *  - Again, make a GET request satisfying the above swagger docs with the requested authorID. Same assumptions as previous case.
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    const {
      title,
      explanation,
      language,
      tags,
      authorID,
      pageSize,
      pageNumber,
    } = req.body;
    try {
      var searchTags = [];
      if (tags) {
        searchTags = tags;
      } else {
        searchTags = [];
      }

      var result = await prisma.CodeTemplate.findMany({
        where: {
          title: { contains: title },
          explanation: { contains: explanation },
          language: { contains: language },
          authorId: authorID,
          tags: tags
            ? {
                some: { name: { in: searchTags } },
              }
            : undefined,
        },
        include: {
          tags: true,
        },
      });
      // So the filtering seems to include code templates with no tags if impossible filters are applied, and i cant find any elegant means of removing them, hence this
      if (tags) {
        console.log("test");
        result = result.filter(verifyTags);
      }

      const paginatedResult = paginateArray(result, pageSize, pageNumber);
      res
        .status(200)
        .json({ message: "Fetch successful", result: paginatedResult });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Template Fetch Failed", error: err });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

function verifyTags(elem) {
  return elem.tags.length > 0;
}

function paginateArray(arr, pageSize, pageNumber) {
  var start = pageSize * (pageNumber - 1);
  var idxs = [...Array(pageSize).keys()];
  var elems = [];

  idxs.forEach((idx) => {
    idx += start;

    if (idx < arr.length) {
      elems.push(arr[idx]);
    }
  });

  return elems;
}
