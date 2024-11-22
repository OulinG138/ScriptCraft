import * as React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import _ from "lodash";

import {
  Stack,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Backdrop,
  CircularProgress,
  Avatar,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

import API from "@/routes/API";
import useAuth from "@/hooks/useAuth";
import BackgroundImage from "@/assets/images/login-background.jpg";

interface FormValues {
  avatarId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

interface Avatar {
  id: number;
  imagePath: string;
}

function PasswordCheckListIcon({ passed = false }: { passed?: boolean }) {
  return (
    <>{passed ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</>
  );
}

export default function SignUp() {
  const { auth } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false);
  const [isSignUpSuccess, setSignUpSuccess] = React.useState(false);
  const [avatars, setAvatars] = React.useState<Avatar[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = React.useState(true);
  const handleShowPasswordClick = () => setShowPassword((show) => !show);
  const handleShowPasswordConfirmClick = () =>
    setShowPasswordConfirm((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const fetchAvatars = async () => {
    try {
      const response = await API.user.getAvatars();
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching avatars:", error);
      return [];
    }
  };

  React.useEffect(() => {
    const loadAvatars = async () => {
      const avatarData = await fetchAvatars();
      setAvatars(avatarData);
      setIsLoadingAvatars(false);
    };

    loadAvatars();
  }, []);

  React.useEffect(() => {
    if (!_.isEmpty(auth?.accessToken) && !_.isEmpty(auth?.user)) {
      router.replace("/");
    }
  }, [auth]);

  const [lowercase, setLowercase] = React.useState(false);
  const [uppercase, setUppercase] = React.useState(false);
  const [number, setNumber] = React.useState(false);
  const [length, setLength] = React.useState(false);

  const validationSchema = yup.object({
    avatarId: yup.number().required("Please select an avatar"),
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup
      .string()
      .email("Email is not valid")
      .required("Email is required"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number is not valid")
      .required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required")
      .test("password-checklist", "Password is not valid", (value) => {
        const errors = validatePassword(value);
        return errors.length === 0;
      }),
    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords do not match"),
  });

  const validatePassword = (value: string) => {
    if (!value) {
      setLowercase(false);
      setUppercase(false);
      setNumber(false);
      setLength(false);
      return ["Password is required"];
    }

    let errors = [];

    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("Password must contain at least 1 lowercase letter");
      setLowercase(false);
    } else {
      setLowercase(true);
    }

    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("Password must contain at least 1 uppercase letter");
      setUppercase(false);
    } else {
      setUppercase(true);
    }

    if (!/(?=.*\d)/.test(value)) {
      errors.push("Password must contain at least 1 number");
      setNumber(false);
    } else {
      setNumber(true);
    }

    if (value.length < 8) {
      errors.push("Password must be at least 8 characters long");
      setLength(false);
    } else {
      setLength(true);
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      avatarId: 1,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      let submission: FormValues = {
        avatarId: values.avatarId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
      };
      try {
        const response = await API.auth.register(submission);
        console.log(response);
        toast.success(response.data.message);
        setSignUpSuccess(true);
      } catch (error: any) {
        console.log(error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to Sign Up");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const value = formik.values.password;

    if (!value || value.trim() === "") {
      setLowercase(false);
      setUppercase(false);
      setNumber(false);
      setLength(false);
      return;
    }

    setLowercase(/(?=.*[a-z])/.test(value));
    setUppercase(/(?=.*[A-Z])/.test(value));
    setNumber(/(?=.*\d)/.test(value));
    setLength(value.length >= 8);
  }, [formik.values.password]);

  return (
    <Grid container component="main" className="min-h-screen">
      <Backdrop
        className="text-white"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={formik.isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid
        item
        className="hidden sm:block sm:w-1/3 md:w-7/12 bg-cover bg-center bg-no-repeat relative"
      >
        <Image
          src={BackgroundImage}
          alt="background"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="absolute inset-0 object-cover"
        />
      </Grid>

      <Grid
        item
        component={Paper}
        elevation={0}
        square
        className="w-full sm:w-2/3 md:w-5/12 flex flex-col justify-center shadow-[-30px_0_40px_-25px_rgba(0,0,0,0.6)]"
      >
        {isSignUpSuccess ? (
          <Box className="mx-4 my-8 flex flex-col items-center space-y-4">
            <Typography component="h1" variant="h4" className="text-center">
              Thank you for signing up!
            </Typography>
            <Link href="/login" passHref className="no-underline">
              <Button
                size="large"
                variant="contained"
                endIcon={<LoginIcon />}
                className="mt-6 mb-4 rounded-full"
              >
                Go to Login
              </Button>
            </Link>
          </Box>
        ) : (
          <Box className="mx-4 my-8 flex flex-col items-stretch space-y-4">
            <Typography
              component="h1"
              variant="h4"
              className="text-center mb-4"
            >
              Sign Up
            </Typography>

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              className="mt-4"
            >
              <Box className="mb-6">
                {isLoadingAvatars ? (
                  <Box className="flex justify-center">
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Box className="flex gap-4 overflow-x-auto p-4 border border-gray-300 bg-gray-50 shadow-md rounded-lg scrollbar-hide">
                    {avatars.map((avatar) => (
                      <Box
                        key={avatar.id}
                        className={`cursor-pointer flex flex-col items-center transition-all duration-300 p-2 rounded-full ${
                          formik.values.avatarId === avatar.id
                            ? "bg-gray-200 scale-105 shadow-md"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          formik.setFieldValue("avatarId", avatar.id)
                        }
                      >
                        <Avatar
                          src={avatar.imagePath}
                          alt={`Avatar ${avatar.id}`}
                          className="w-20 h-20"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
                {formik.touched.avatarId && formik.errors.avatarId && (
                  <Typography
                    variant="caption"
                    className="mt-2 text-red-500 block"
                  >
                    {formik.errors.avatarId}
                  </Typography>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item className="w-full md:w-1/2">
                  <TextField
                    fullWidth
                    id="firstName"
                    required
                    name="firstName"
                    label="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
                    }
                    helperText={
                      formik.touched.firstName && formik.errors.firstName
                    }
                    autoFocus
                    autoComplete="given-name"
                    className="bg-white"
                  />
                </Grid>

                <Grid item className="w-full md:w-1/2">
                  <TextField
                    fullWidth
                    required
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.lastName && Boolean(formik.errors.lastName)
                    }
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
                    }
                    autoComplete="family-name"
                    className="bg-white"
                  />
                </Grid>

                <Grid item className="w-full">
                  <TextField
                    fullWidth
                    id="email"
                    required
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    autoComplete="email"
                    className="bg-white"
                  />
                </Grid>

                <Grid item className="w-full">
                  <TextField
                    fullWidth
                    required
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.phoneNumber &&
                      Boolean(formik.errors.phoneNumber)
                    }
                    helperText={
                      formik.touched.phoneNumber && formik.errors.phoneNumber
                    }
                    autoComplete="tel"
                    className="bg-white"
                  />
                </Grid>

                <Grid item className="w-full">
                  <TextField
                    fullWidth
                    required
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    autoComplete="new-password"
                    className="bg-white"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleShowPasswordClick}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item className="w-full">
                  <TextField
                    fullWidth
                    required
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.confirmPassword &&
                      Boolean(formik.errors.confirmPassword)
                    }
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    autoComplete="new-password"
                    className="bg-white"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleShowPasswordConfirmClick}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPasswordConfirm ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item className="w-full">
                  <Stack spacing={1}>
                    <Box className="flex items-center space-x-2">
                      <PasswordCheckListIcon passed={lowercase} />
                      <Typography
                        variant="body2"
                        className={
                          lowercase ? "text-gray-700" : "text-gray-400"
                        }
                      >
                        At least one lowercase letter
                      </Typography>
                    </Box>
                    <Box className="flex items-center space-x-2">
                      <PasswordCheckListIcon passed={uppercase} />
                      <Typography
                        variant="body2"
                        className={
                          uppercase ? "text-gray-700" : "text-gray-400"
                        }
                      >
                        At least one uppercase letter
                      </Typography>
                    </Box>
                    <Box className="flex items-center space-x-2">
                      <PasswordCheckListIcon passed={number} />
                      <Typography
                        variant="body2"
                        className={number ? "text-gray-700" : "text-gray-400"}
                      >
                        At least one number
                      </Typography>
                    </Box>
                    <Box className="flex items-center space-x-2">
                      <PasswordCheckListIcon passed={length} />
                      <Typography
                        variant="body2"
                        className={length ? "text-gray-700" : "text-gray-400"}
                      >
                        At least 8 characters
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
                className="mt-6 mb-4 rounded-full bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
              <Box display="flex" justifyContent="center" className="mt-1">
                Already have an account?
                <Link href="/login">
                  <Typography className="text-blue-500 hover:underline inline ml-2">
                    Login
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
