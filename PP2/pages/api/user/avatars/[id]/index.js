import prisma from "@/utils/db";

/**
 * @swagger
 * /api/user/avatars/{id}:
 *   get:
 *     summary: Get avatar image path by ID
 *     description: Fetches the image path of a user avatar based on the provided ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique identifier of the avatar
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Avatar image path retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imagePath:
 *                   type: string
 *                   description: The file path of the avatar image
 *                   example: "/avatars/avatar1.png"
 *       400:
 *         description: Invalid request (e.g., missing or invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID is required"
 *       404:
 *         description: Avatar not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Avatar not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const avatar = await prisma.avatar.findUnique({
      where: { id: parseInt(id, 10) },
      select: { imagePath: true },
    });

    if (!avatar) {
      return res.status(404).json({ error: "Avatar not found" });
    }

    return res.status(200).json({ imagePath: avatar.imagePath });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
