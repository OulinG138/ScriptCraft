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
import { features } from "@/constants/constants";

export default function HomePage() {
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
          Frobnicate snizzleflorp zibble wibblefrock trundleplank
          shizzlegrabble. Plinkadinkle fragglestaff wobberfribble glornicksnap
          prinkleflorps.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          className="rounded-full"
        >
          Get Started
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
                    Learn More
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
