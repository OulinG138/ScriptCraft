import { hashPassword } from "@/utils/auth";
import prisma from "@/utils/db";

const languages = [
  "python",
  "javascript",
  "java",
  "c",
  "cpp",
  "shell",
  "rust",
  "lua",
  "ruby",
  "r",
];

const codeSnippets = [
  // Python
  `print("Hello from Python!")`,

  // JavaScript
  `console.log("Hello from JavaScript!");`,

  // Java
  `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,

  // C
  `#include <stdio.h>
int main() {
    printf("Hello from C!\\n");
    return 0;
}`,

  // C++
  `#include <iostream>
int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,

  // Shell
  `echo "Hello from Shell!"`,

  // Rust
  `fn main() {
    println!("Hello from Rust!");
}`,

  // Lua
  `print("Hello from Lua!")`,

  // Ruby
  `puts "Hello from Ruby!"`,

  // R
  `print("Hello from R!")`,
];

const tags = [
  "Algorithms",
  "Data Structures",
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Database",
  "Security",
  "Cloud Computing",
  "DevOps",
  "Programming Basics",
];

async function main() {
  // Create Avatars
  const avatarData = [
    { imagePath: "/avatars/User%20avatar%20Meerkat.png" },
    { imagePath: "/avatars/User%20avatar%20bear.png" },
    { imagePath: "/avatars/User%20avatar%20cat.png" },
    { imagePath: "/avatars/User%20avatar%20chicken.png" },
    { imagePath: "/avatars/User%20avatar%20fox.png" },
    { imagePath: "/avatars/User%20avatar%20panda.png" },
    { imagePath: "/avatars/User%20avatar%20sea%20lion.png" },
  ];

  const avatars = [];
  for (const avatar of avatarData) {
    const createdAvatar = await prisma.avatar.create({
      data: avatar,
    });
    avatars.push(createdAvatar);
  }

  // Create Tags
  const createdTags = [];
  for (const tagName of tags) {
    const tag = await prisma.tag.create({
      data: { name: tagName },
    });
    createdTags.push(tag);
  }

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phoneNumber: "4165550198",
      password: await hashPassword("adminpassword"),
      isAdmin: true,
      avatarId: avatars[0].id,
    },
  });

  // Create Regular Users
  const users = [admin];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: `User${i}`,
        lastName: `Smith${i}`,
        email: `user${i}@example.com`,
        phoneNumber: `416555${String(i).padStart(4, "0")}`,
        password: await hashPassword("userpassword"),
        isAdmin: false,
        avatarId: avatars[i % avatars.length].id,
      },
    });
    users.push(user);
  }

  const templates = [];
  for (let i = 0; i < 40; i++) {
    const languageIndex = i % languages.length;
    const template = await prisma.codeTemplate.create({
      data: {
        title: `${languages[languageIndex]} Example ${i + 1}`,
        explanation: `A simple ${languages[languageIndex]} print statement example.`,
        codeContent: codeSnippets[languageIndex],
        language: languages[languageIndex],
        authorId: users[i % users.length].id,
        tags: {
          connect: [
            { id: createdTags[i % createdTags.length].id },
            { id: createdTags[(i + 1) % createdTags.length].id },
          ],
        },
      },
    });
    templates.push(template);
  }

  // Create Blog Posts with proper counts
  const posts = [];
  for (let i = 0; i < 40; i++) {
    const templateIndex = i % templates.length;
    const tagIndex = i % createdTags.length;
    const post = await prisma.blogPost.create({
      data: {
        title: `Getting Started with ${languages[i % languages.length]}`,
        description: `Learn how to write your first ${languages[i % languages.length]} program.`,
        content: `# Introduction to ${languages[i % languages.length]}

Let's start with a simple print statement:

\`\`\`${languages[i % languages.length]}
${templates[templateIndex].codeContent}
\`\`\`

This is the simplest program you can write in ${languages[i % languages.length]}.`,
        authorId: users[i % users.length].id,
        isHidden: false,
        ratingCount: 0,
        reportCount: 0,
        tags: {
          connect: [
            { id: createdTags[tagIndex].id },
            { id: createdTags[(tagIndex + 1) % createdTags.length].id },
          ],
        },
        codeTemplates: {
          connect: [{ id: templates[templateIndex].id }],
        },
      },
    });
    posts.push(post);
  }

  // Create Comments with proper counts
  const comments = [];
  for (let i = 0; i < 40; i++) {
    const comment = await prisma.comment.create({
      data: {
        content: `${
          [
            "Great introduction!",
            "Simple and clear.",
            "Thanks for sharing!",
            "Very helpful for beginners.",
            "Nice example!",
          ][i % 5]
        }`,
        authorId: users[i % users.length].id,
        postId: posts[i % posts.length].id,
        isHidden: false,
        ratingCount: 0,
        reportCount: 0,
      },
    });
    comments.push(comment);
  }

  // Create Reports and update counts
  for (let i = 0; i < 40; i++) {
    const isPostReport = i % 2 === 0;
    const targetId = isPostReport
      ? posts[i % posts.length].id
      : comments[i % comments.length].id;

    await prisma.report.create({
      data: {
        explanation: `${
          [
            "Needs review",
            "Possible duplicate",
            "Check content",
            "Verify example",
            "Review code",
          ][i % 5]
        }`,
        targetType: isPostReport ? "post" : "comment",
        isResolved: i % 3 === 0,
        reporterId: users[i % users.length].id,
        blogPostId: isPostReport ? targetId : null,
        commentId: isPostReport ? null : targetId,
      },
    });

    // Update report counts
    if (isPostReport) {
      await prisma.blogPost.update({
        where: { id: targetId },
        data: { reportCount: { increment: 1 } },
      });
    } else {
      await prisma.comment.update({
        where: { id: targetId },
        data: { reportCount: { increment: 1 } },
      });
    }
  }

  // Create Ratings and update counts
  for (let i = 0; i < 40; i++) {
    const isPostRating = i % 2 === 0;
    const targetId = isPostRating
      ? posts[i % posts.length].id
      : comments[i % comments.length].id;

    await prisma.rating.create({
      data: {
        value: i % 2,
        targetType: isPostRating ? "post" : "comment",
        userId: users[i % users.length].id,
        blogPostId: isPostRating ? targetId : null,
        commentId: isPostRating ? null : targetId,
      },
    });

    // Update rating counts
    if (isPostRating) {
      await prisma.blogPost.update({
        where: { id: targetId },
        data: { ratingCount: { increment: 1 } },
      });
    } else {
      await prisma.comment.update({
        where: { id: targetId },
        data: { ratingCount: { increment: 1 } },
      });
    }
  }

  console.log("Database has been seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
