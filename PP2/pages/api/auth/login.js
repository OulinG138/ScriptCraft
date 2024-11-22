import prisma from "@/utils/db";
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/auth";
import { getRefreshTokenCookie } from "@/utils/auth";
import _ from "lodash";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user by validating their email and password. If successful, it returns an access token, refresh token (via cookie), and basic user details.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: mySecretPassword123
 *     responses:
 *       200:
 *         description: Login successful. Returns the access token, user details, and sets the refresh token as a cookie.
 *         headers:
 *           Set-Cookie:
 *             description: Contains the refresh token stored as an HTTP-only cookie.
 *             schema:
 *               type: string
 *               example: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=2592000; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The JWT access token for authentication.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   description: Basic user information.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user's id
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       description: The user's first name.
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       description: The user's last name.
 *                       example: Doe
 *                     avatarId:
 *                       type: integer
 *                       description: The user's avatar ID.
 *                       example: 1
 *                     isAdmin:
 *                       type: boolean
 *                       description: Whether the user has admin privileges.
 *                       example: false
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating missing input fields.
 *                   example: Please provide all the required fields
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating incorrect email or password.
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for unexpected issues.
 *                   example: Internal server error
 *       405:
 *         description: Method not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for unsupported HTTP methods.
 *                   example: Method not allowed
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide all the required fields",
      });
    }

    try {
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordValid = await verifyPassword(password, user.password);

      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      user = _.pick(user, [
        "id",
        "firstName",
        "lastName",
        "avatarId",
        "isAdmin",
      ]);

      res.setHeader(
        "Set-Cookie",
        getRefreshTokenCookie(
          refreshToken,
          60 * 60 * 24 * parseInt(process.env.REFRESH_TOKEN_EXPIRATION)
        )
      );

      return res.status(200).json({ accessToken, user });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
