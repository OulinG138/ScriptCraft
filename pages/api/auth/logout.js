import { getRefreshTokenCookie } from "@/utils/auth";

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout and clear refresh token
 *     description: Clears the refresh token by deleting the cookie from the client.
 *     tags:
 *       - Auth
 *     responses:
 *       204:
 *         description: Refresh token cleared successfully, no content returned.
 *       400:
 *         description: No refresh token provided in cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No refresh token provided
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
  if (req.method === "GET") {
    const refreshToken = req.cookies.token;

    if (!refreshToken) {
      return res.status(400).json({ error: "No refresh token provided" });
    }

    res.setHeader("Set-Cookie", getRefreshTokenCookie(null, 0));
    res.status(204).send();
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
