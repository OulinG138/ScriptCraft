import { PrismaClient } from "@prisma/client";
import { verifyLoggedIn } from "@/utils/auth";

/**
 * @swagger
 * /api/code/template/[id]:
 *   get:
 *     summary: Fetches requested code template
 *     description: Allows users to get a specific code template
 *     tags:
 *       - Code
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the code template to get
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fetch successful, returns requested template
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
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template Fetch Failed
 *   post:
 *     summary: Code template forking
 *     description: Creates a fork of an existing template
 *     tags:
 *       - Code
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the code template to fork
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fork successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fork successful"
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
 *                          type: int
 *                          example: 1
 *                      tags:
 *                          type: array
 *                          example:
 *                             - id: 1
 *                               name: "tag"
 *       401:
 *         description: Account required
 *       402:
 *         description: Parent template not found
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template Creation Failed
 *   put:
 *     summary: Code template editing
 *     description: Allows the user to change properties of an existing code template
 *     tags:
 *       - Code
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the code template to edit
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         description: Code template successfully modified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Template edit successful"
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
 *                          type: id | null
 *                          example: 1
 *                      tags:
 *                          type: array
 *                          example:
 *                             - id: 1
 *                               name: "tag"
 *       401:
 *         description: Account required
 *       402:
 *         description: Only owner may edit template
 *       403:
 *         description: Template not found
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template save Failed
 *   delete:
 *     summary: Code template deletion
 *     description: Deletes a new code template in the system
 *     tags:
 *       - Code
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the code template to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deletion successful, returns deleted template
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Deletion successful"
 *       401:
 *         description: Account required
 *       402:
 *         description: Template not found
 *       403:
 *         description: Only owner may delete template
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Template deletion Failed
 */

/**
 * Implemented User Stories:
 *
 * As a visitor, I want to use an existing code template, [...] and if desired, save
 * it as a new template with a notification that it’s a forked version, so I can build on others’ work.
 * Saving a template is only available to authenticated users.
 * - Make a POST request satisfying the above swagger docs. Assume inputs are preent and of the correct type.
 *
 * As a user, I want to edit an existing code template’s title, explanation, tags, and code [...].
 *  - Make a PUT request satisfying the above swagger docs. <tags> must be an array
 *    that is either populated with strings or empty. Assume all inputs are present and of the
 *    correct type.
 *
 * As a user, I want to edit an existing code template’s title, explanation, tags, and code, or delete it entirely.
 *  - Make a DELETE request satisfying above swagger docs. Assume all inputs are present and of the correct type.
 */

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;
    const templateID = Number(id);
    try {
      var result = await prisma.CodeTemplate.findFirst({
        where: {
          id: templateID,
        },
        include: {
          tags: true,
        },
      });

      if (result) {
        res.status(200).json({ message: "Get successful", result: result });
      } else {
        res.status(401).json({ message: "Template not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Template Fetch Failed", error: err });
    }
  } else if (req.method === "POST") {
    const { id } = req.query;

    verifyLoggedIn(req);
    const parentTemplateID = Number(id);
    try {
      const refTemplate = await prisma.CodeTemplate.findFirst({
        where: {
          id: parentTemplateID,
        },
        include: {
          tags: true,
        },
      });

      if (refTemplate === null) {
        res.status(402).json({ message: "Template to fork not found" });
      } else if (!req.user) {
        res
          .status(201)
          .json({ message: "Fork Successful", template: refTemplate });
      } else {
        const template = await prisma.CodeTemplate.create({
          data: {
            title: refTemplate.title,
            explanation: refTemplate.explanation,
            codeContent: refTemplate.codeContent,
            language: refTemplate.language,
            authorId: req.user.sub,
            parentTemplateId: parentTemplateID,
            tags: {
              connectOrCreate: refTemplate.tags.map((tag) => {
                return {
                  where: { name: tag.name },
                  create: { name: tag.name },
                };
              }),
            },
          },
          include: {
            tags: true,
          },
        });
        res
          .status(200)
          .json({ messsage: "Fork Successful", template: template });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Template Fork Failed" });
    }
  } else if (req.method === "PUT") {
    const { title, explanation, codeContent, language, tags } = req.body;
    const { id } = req.query;

    const templateID = Number(id);
    verifyLoggedIn(req);

    if (!req.user) {
      res.status(401).json({ message: "Account Required" });
    } else {
      try {
        const refTemplate = await prisma.CodeTemplate.findFirst({
          where: {
            id: templateID,
          },
          include: {
            tags: true,
          },
        });

        if (refTemplate === null) {
          res.status(403).json({ message: "Template not Found" });
        } else if (refTemplate.authorId === req.user.sub) {
          var insertTags = [];
          if (!tags) {
            refTemplate.tags.forEach((element) => {
              insertTags.push(element.name);
            });
          } else {
            insertTags = tags;
          }

          const result = await prisma.CodeTemplate.update({
            where: {
              id: templateID,
            },
            data: {
              title: title,
              explanation: explanation,
              codeContent: codeContent,
              language: language,
              tags: {
                set: [],
                connectOrCreate: insertTags.map((tag) => {
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
          res
            .status(200)
            .json({ message: "Template edit successful", result: result });
        } else {
          res.status(402).json({ message: "Only owner may edit template" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Template Save Failed" });
      }
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    const templateID = Number(id);
    verifyLoggedIn(req);
    if (req.user) {
      try {
        const template = await prisma.CodeTemplate.findFirst({
          where: {
            id: templateID,
          },
        });

        if (template === null) {
          res.status(402).json({ message: "Template Not Found" });
        } else if (template.authorId === req.user.sub) {
          const result = await prisma.CodeTemplate.delete({
            where: {
              id: templateID,
            },
          });
          res.status(200).json({ message: "Deletion successful" });
        } else {
          res.status(403).json({ message: "Only owner may delete template" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Database Error" });
      }
    } else {
      res.status(401).json({ message: "Deleting for users only" });
    }
  } else if (req.method === "POST") {
    const { id } = req.query;

    verifyLoggedIn(req);
    const parentTemplateID = Number(id);
    try {
      const refTemplate = await prisma.CodeTemplate.findFirst({
        where: {
          id: parentTemplateID,
        },
        include: {
          tags: true,
        },
      });

      if (refTemplate === null) {
        res.status(402).json({ message: "Template to fork not found" });
      } else if (!req.user) {
        res
          .status(201)
          .json({ message: "Fork Successful", template: refTemplate });
      } else {
        const template = await prisma.CodeTemplate.create({
          data: {
            title: refTemplate.title,
            explanation: refTemplate.explanation,
            codeContent: refTemplate.codeContent,
            language: refTemplate.language,
            authorId: req.user.sub,
            parentTemplateId: parentTemplateID,
            tags: {
              connectOrCreate: refTemplate.tags.map((tag) => {
                return {
                  where: { name: tag.name },
                  create: { name: tag.name },
                };
              }),
            },
          },
          include: {
            tags: true,
          },
        });
        res
          .status(200)
          .json({ messsage: "Fork Successful", template: template });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Template Fork Failed" });
    }
  } else if (req.method === "PUT") {
    const { title, explanation, codeContent, language, tags } = req.body;
    const { id } = req.query;

    const templateID = Number(id);
    verifyLoggedIn(req);

    if (!req.user) {
      res.status(401).json({ message: "Account Required" });
    } else {
      try {
        const refTemplate = await prisma.CodeTemplate.findFirst({
          where: {
            id: templateID,
          },
          include: {
            tags: true,
          },
        });

        if (refTemplate === null) {
          res.status(403).json({ message: "Template not Found" });
        } else if (refTemplate.authorId === req.user.sub) {
          var insertTags = [];
          if (!tags) {
            refTemplate.tags.forEach((element) => {
              insertTags.push(element.name);
            });
          } else {
            insertTags = tags;
          }

          const result = await prisma.CodeTemplate.update({
            where: {
              id: templateID,
            },
            data: {
              title: title,
              explanation: explanation,
              codeContent: codeContent,
              language: language,
              tags: {
                set: [],
                connectOrCreate: insertTags.map((tag) => {
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
          res
            .status(200)
            .json({ message: "Template edit successful", result: result });
        } else {
          res.status(402).json({ message: "Only owner may edit template" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Template Save Failed" });
      }
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    const templateID = Number(id);
    verifyLoggedIn(req);
    if (req.user) {
      try {
        const template = await prisma.CodeTemplate.findFirst({
          where: {
            id: templateID,
          },
        });

        if (template === null) {
          res.status(402).json({ message: "Template Not Found" });
        } else if (template.authorId === req.user.sub) {
          const result = await prisma.CodeTemplate.delete({
            where: {
              id: templateID,
            },
          });
          res
            .status(200)
            .json({ message: "Deletion successful", template: result });
        } else {
          res.status(403).json({ message: "Only owner may delete template" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Database Error" });
      }
    } else {
      res.status(401).json({ message: "Deleting for users only" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
