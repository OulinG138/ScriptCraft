import { verifyToken } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: Retrieves the profile information of the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 avatar:
 *                   type: string
 *                   example: "http://example.com/avatar.jpg"
 *                 phoneNumber:
 *                   type: string
 *                   example: "+15551234567"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Error fetching user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching user profile
 *
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Updates the profile information of the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               avatarId:
 *                 type: integer
 *                 example: 1
 *               phoneNumber:
 *                 type: string
 *                 example: "+15551234567"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     avatar:
 *                       type: string
 *                       example: "http://example.com/avatar.jpg"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+15551234567"
 *       400:
 *         description: First name, last name, and email are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: First name, last name, and email are required
 *       500:
 *         description: Error updating profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error updating profile
 */

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const userId = req.user.sub;

    switch (req.method) {
      case "GET":
        try {
          const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: {
                select: {
                  id: true,
                  imagePath: true,
                },
              },
            },
          });

          if (!userProfile) {
            return res.status(404).json({ error: "User not found" });
          }

          return res.status(200).json(userProfile);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Error fetching user profile" });
        }

      case "PUT":
        const { firstName, lastName, email, avatarId, phoneNumber } = req.body;

        if (!firstName || !lastName || !email) {
          return res
            .status(400)
            .json({ error: "First name, last name, and email are required" });
        }

        try {
          const updateData = {
            firstName,
            lastName,
            email,
            phoneNumber,
          };

          if (avatarId) {
            updateData.avatar = { connect: { id: avatarId } };
          }

          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: {
                select: {
                  id: true,
                  imagePath: true,
                },
              },
            },
          });

          return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Error updating profile" });
        }

      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).json({ error: "Method not allowed" });
    }
  });
}
