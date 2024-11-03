import { hashPassword } from "@/utils/auth";
import prisma from "@/utils/db";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Registers a new user in the system.
 *     tags:
 *       - Auth
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
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: StrongPassword123
 *               avatarId:
 *                 type: integer
 *                 description: The id to the user's avatar image.
 *                 example: 1
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number.
 *                 example: "+15551234567"
 *     responses:
 *       201:
 *         description: Successfully signed up, returns the user's basic information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully signed up!
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
 *         description: Missing required fields or email already in use.
 *       405:
 *         description: Method not allowed.
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { firstName, lastName, email, password, avatarId, phoneNumber } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Please provide all the required fields",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use!" });
    }

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: await hashPassword(password),
        avatar: {
          connect: {
            id: avatarId,
          },
        },
        phoneNumber,
        isAdmin: false,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatar: {
          select: {
            imagePath: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Successfully signed up!", user: newUser });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
