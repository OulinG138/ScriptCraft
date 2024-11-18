import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Next.js API Documentation",
    version: "1.0.0",
    description: "API documentation for Next.js project",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Post: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          content: {
            type: "string",
          },
          isHidden: {
            type: "boolean",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          ratingCount: {
            type: "integer",
          },
          reportCount: {
            type: "integer",
          },
          authorId: {
            type: "integer",
          },
        },
      },
      Report: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          explanation: {
            type: "string",
          },
          targetType: {
            type: "string",
          },
          isResolved: {
            type: "boolean",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          reporterID: {
            type: "integer",
          },
          blogPostId: {
            type: "integer",
          },
          commentId: {
            type: "integer",
            nullable: true,
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          content: {
            type: "string",
          },
          isHidden: {
            type: "boolean",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          ratingCount: {
            type: "integer",
          },
          reportCount: {
            type: "integer",
          },
          parentCommentId: {
            type: "integer",
            nullable: true,
          },
          authorId: {
            type: "integer",
          },
          postId: {
            type: "integer",
          },
        },
      },
      Rating: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          value: {
            type: "integer",
          },
          targetType: {
            type: "string",
            enum: ["comment", "blogPost"],
          },
          userId: {
            type: "integer",
          },
          blogPostId: {
            type: "integer",
            nullable: true,
          },
          commentId: {
            type: "integer",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./pages/api/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(swaggerSpec);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
