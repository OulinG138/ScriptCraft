import { hashPassword } from "@/utils/auth";
import prisma from "@/utils/db";

async function main() {
  const avatarData = [
    { imagePath: "/avatars/User%20avatar%20Meerkat.png" },
    { imagePath: "/avatars/User%20avatar%20bear.png" },
    { imagePath: "/avatars/User%20avatar%20cat.png" },
    { imagePath: "/avatars/User%20avatar%20chicken.png" },
    { imagePath: "/avatars/User%20avatar%20fox.png" },
    { imagePath: "/avatars/User%20avatar%20panda.png" },
    { imagePath: "/avatars/User%20avatar%20sea%20lion.png" },
  ];

  for (const avatar of avatarData) {
    await prisma.avatar.create({
      data: avatar,
    });
  }

  const adminUserData = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: await hashPassword("adminpassword"),
    isAdmin: true,
    avatarId: 1,
  };

  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminUserData.email },
  });

  if (!existingAdmin) {
    // Create the admin user
    await prisma.user.create({
      data: adminUserData,
    });
    console.log("Admin user created successfully.");
  } else {
    console.log("Admin user already exists.");
  }
}

// Execute the seed script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
