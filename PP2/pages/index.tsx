import React from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
} from "@mui/material";
import blurredCode from "@/assets/images/blurred_code.png";
import blurredBlog from "@/assets/images/blurred_blog.png";

export default function HomePage() {

  const features = [
    {
      title: "Blog Posts",
      description: "Share your thoughts with the world",
      link: "/posts",
      image: blurredBlog.src
    },
    {
      title: "Coding",
      description: "Write and test some code snippets",
      link: "/coding",
      image: blurredCode.src
    },
    {
      title: "Code Templates",
      description: "Try someone's code and make a copy",
      link: "/code-templates",
      image: blurredCode.src
    }
]
  return (
    <>
      <Paper
        elevation={3}
        className="flex flex-col justify-center items-center text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      >
        <Typography variant="h3" className="font-bold mb-4">
          Welcome to Scriptorium
        </Typography>
        <Typography variant="h6" className="max-w-xl mb-6">
          Inspired by the ancient concept of a scriptorium, a place where manuscripts were crafted and preserved, Scriptorium modernizes 
          this idea for the digital age. Whether you’re testing a quick snippet or building a reusable code example, 
          Scriptorium is what you need to bring your ideas to life.
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          className="rounded-full"
          href={"/coding"}
        >
          Start Coding
        </Button>
      </Paper>

      <Container className="py-16">
        <Typography
          variant="h4"
          className="text-center font-bold mb-8 text-gray-500"
        >
          Our Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card className="shadow-md transition-transform transform hover:scale-105">
                <CardMedia
                  component="img"
                  height="140"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent className="text-center">
                  <Typography variant="h6" className="font-bold mb-2">
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-gray-600 mb-4"
                    gutterBottom
                  >
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={feature.link}
                  >
                    Go Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Paper className="text-center py-4 bg-gray-800 text-white" elevation={1}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Scriptorium. All Rights Reserved.
        </Typography>
      </Paper>
    </>
  );
}
