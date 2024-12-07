import { PrismaClient } from "@prisma/client";
import { verifyLoggedIn } from "@/utils/auth";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/code/template:
 *   post:
 *     summary: Code template creation
 *     description: Creates a new code template in the system
 *     tags:
 *       - Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - explanation
 *               - language
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the code template
 *                 example: Hello World
 *               explanation:
 *                 type: string
 *                 description: A description of what the code template does
 *                 example: Prints "Hello World"
 *               codeContent:
 *                 type: string
 *                 description: Raw text of the contents of the code template
 *                 example: print("Hello World")
 *               language:
 *                 type: string
 *                 description: The coding language the code template is in
 *                 example: python
 *               tags:
 *                 type: Array[String]
 *                 description: A list of tags to give to the code template
 *                 example: ["basic"]
 *     responses:
 *       200:
 *         description: Code template successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Template creation successful"
 *                 template:
 *                   type: object
 *                   properties:
 *                      title:
 *                          type: string
 *                          example: Hello World
 *                      explanation:
 *                          type: string
 *                          example: Prints "Hello World"
 *                      codeContent:
 *                          type: string
 *                          example: print("Hello World")
 *                      language:
 *                          type: string
 *                          example: python
 *                      authorId:
 *                          type: int
 *                          example: 1
 *                      parentTemplateId:
 *                          type: null
 *                          example: null
 *                      tags:
 *                          type: array
 *                          example:
 *                             - id: 1
 *                               name: "tag"
 *       400:
 *         description: Missing required entry fields
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template Creation Failed
 */

/**
 * User Story Implementation:
 *
 * As a user (authenticated), I want to save my code as a template with a title,
 * explanation, and tags so that I can organize and share my work effectively.
 *  - Make a POST request satisfying the above swagger docs. <tags> must be an array
 *    that is either populated with strings or empty. Assume all inputs are present and of the
 *    correct type.
 */

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, explanation, codeContent, language, tags } = req.body;

    if (!title || !explanation || !language) {
      res.status(400).json({ message: "Missing required entry fields" });
    } else {
      verifyLoggedIn(req);
      if (req.user) {
        try {
          const template = await prisma.CodeTemplate.create({
            data: {
              title: title,
              explanation: explanation,
              codeContent: codeContent,
              language: language,
              authorId: req.user.sub,
              tags: {
                connectOrCreate: tags.map((tag) => {
                  return {
                    where: { name: tag },
                    create: { name: tag },
                  };
                }),
              },
            },
            include: {
              tags: true,
            },
          });

          res.status(200).json({
            message: "Template creation successful",
            template: template,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Template Creation Failed" });
        }
      } else {
        res.status(401).json({ message: "Account Required" });
      }
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
