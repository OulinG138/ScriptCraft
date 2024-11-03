import prisma from "@/utils/db";

/**
 * @swagger
 * /api/user/avatars:
 *   get:
 *     summary: Retrieve all avatars
 *     description: Returns a list of all avatars stored in the database.
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: A JSON array of avatars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The avatar ID.
 *                   imagePath:
 *                     type: string
 *                     description: The path of the avatar image.
 *       500:
 *         description: Error fetching avatars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const avatars = await prisma.avatar.findMany({
        select: {
          id: true,
          imagePath: true,
        },
      });
      return res.status(200).json(avatars);
    } catch (error) {
      return res.status(500).json({ error: "Error fetching avatars" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
