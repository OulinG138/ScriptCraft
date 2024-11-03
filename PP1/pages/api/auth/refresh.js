import { verifyRefreshToken, generateAccessToken } from "@/utils/auth";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token provided during login.
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
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
 *                   example: Invalid or expired refresh token
 *       405:
 *         description: Method not allowed.
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "No refresh token provided" });
    }

    try {
      const payloadDecoded = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken(payloadDecoded);

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
