import { verifyRefreshToken, generateAccessToken } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token stored in cookies. A new refresh token cookie is also set.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *         headers:
 *           Set-Cookie:
 *             description: A new refresh token cookie is set.
 *             schema:
 *               type: string
 *               example: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: No refresh token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No refresh token provided
 *       401:
 *         description: Invalid or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Expired refresh token
 *       401:
 *         description: Invalid refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid refresh token
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
 *       405:
 *         description: Method not allowed.
 *         headers:
 *           Allow:
 *             description: Allowed HTTP methods.
 *             schema:
 *               type: string
 *               example: POST
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Method not allowed
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const refreshToken = req.cookies.token;

    if (!refreshToken) {
      return res.status(400).json({ error: "No refresh token provided" });
    }

    try {
      const payloadDecoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payloadDecoded.sub },
      });
      if (!user) {
        res.setHeader("Set-Cookie", getRefreshTokenCookie(null, 0));
        return res.status(404).json({ error: "User not found" });
      }

      const newAccessToken = generateAccessToken(user);

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.setHeader("Set-Cookie", getRefreshTokenCookie(null, 0));
        return res.status(401).json({ error: "Expired refresh token" });
      }

      return res.status(401).json({ error: "Invalid refresh token" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
