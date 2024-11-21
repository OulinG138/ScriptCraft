import { verifyToken, hashPassword, verifyPassword } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/user/profile/password:
 *   put:
 *     summary: Update the user's password
 *     description: Updates the user's password after verifying the current password.
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: NewP@ssw0rd456
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Invalid current password or new password requirements not met.
 *       500:
 *         description: Error updating password.
 */
export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const userId = req.user.sub;

    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordMatch = await verifyPassword(
        currentPassword,
        user.password
      );
      if (!isPasswordMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedNewPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error updating password" });
    }
  });
}
