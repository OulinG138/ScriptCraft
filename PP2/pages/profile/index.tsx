import * as React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import _ from "lodash";

import UserTemplates from "./components/UserTemplates";
import UserPosts from "./components/UserPosts";

import {
  Menu,
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
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";

import API from "@/routes/API";
import useAuth from "@/hooks/useAuth";

interface ProfileFormValues {
  avatarId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

interface User {
  avatarId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface Avatar {
  id: number;
  imagePath: string;
}

function PasswordCheckListIcon({ passed = false }: { passed?: boolean }) {
  return (
    <Box className="inline-flex items-center">
      {passed ? (
        <CheckCircleIcon className="text-green-500" />
      ) : (
        <CloseIcon className="text-red-500" />
      )}
    </Box>
  );
}

export default function Profile() {
  const { auth, setAuth } = useAuth();
  const [user, setUser] = React.useState<User>({
    avatarId: 1,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [isEditingPassword, setIsEditingPassword] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [avatars, setAvatars] = React.useState<Avatar[]>([]);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [tempAvatarUrl, setTempAvatarUrl] = React.useState<string | null>(null);
  const [isLoadingAvatars, setIsLoadingAvatars] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [displayInfo, setDisplayInfo] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [lowercase, setLowercase] = React.useState(false);
  const [uppercase, setUppercase] = React.useState(false);
  const [number, setNumber] = React.useState(false);
  const [length, setLength] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("profile");

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await API.user.getUserProfile(
          _.get(auth, "accessToken", "")
        );
        const userProfile = response.data;

        setUser({
          avatarId: userProfile.avatar.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phoneNumber: userProfile.phoneNumber,
        });

        setDisplayInfo({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      } finally {
        setIsLoadingUser(false);
      }
    };

    const fetchAvatars = async () => {
      try {
        if (auth.user?.avatarId) {
          const response = await API.user.getAvatarById(auth.user.avatarId);
          setAvatarUrl(response.data.imagePath);
        }

        const response = await API.user.getAvatars();
        setAvatars(response.data);
      } catch (error) {
        console.error("Error fetching avatars:", error);
        toast.error("Failed to load avatars");
      } finally {
        setIsLoadingAvatars(false);
      }
    };

    fetchUserProfile();
    fetchAvatars();
  }, []);

  const profileValidationSchema = yup.object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  const passwordValidationSchema = yup.object({
    currentPassword: yup.string().when("isEditingPassword", {
      is: true,
      then: (schema) => schema.required("Current password is required"),
    }),
    newPassword: yup.string().when("isEditingPassword", {
      is: true,
      then: (schema) =>
        schema
          .required("New password is required")
          .min(8, "Password must be at least 8 characters")
          .test(
            "password-checklist",
            "Password requirements not met",
            (value) => {
              if (!value) return false;
              const errors = validatePassword(value);
              return errors.length === 0;
            }
          ),
    }),
  });

  const validatePassword = (value: string) => {
    if (!value || value.trim() === "") {
      setLowercase(false);
      setUppercase(false);
      setNumber(false);
      setLength(false);
      return ["Password is required"];
    }

    let errors = [];

    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("Must contain lowercase letter");
      setLowercase(false);
    } else {
      setLowercase(true);
    }

    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("Must contain uppercase letter");
      setUppercase(false);
    } else {
      setUppercase(true);
    }

    if (!/(?=.*\d)/.test(value)) {
      errors.push("Must contain number");
      setNumber(false);
    } else {
      setNumber(true);
    }

    if (value.length < 8) {
      errors.push("Must be 8+ characters");
      setLength(false);
    } else {
      setLength(true);
    }

    return errors;
  };

  const profileFormik = useFormik<ProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      avatarId: user.avatarId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        await API.user.updateUserProfile(
          _.get(auth, "accessToken", ""),
          values
        );
        toast.success("Profile updated successfully!");

        setDisplayInfo({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });

        setAuth((prevAuth) => ({
          ...prevAuth,
          user: {
            ...prevAuth.user!,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            avatarId: values.avatarId,
            isAdmin: prevAuth.user?.isAdmin ?? false,
          },
        }));

        setIsEditingProfile(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to update profile");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordFormik = useFormik<PasswordFormValues>({
    enableReinitialize: true,
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        await API.user.updatePassword(_.get(auth, "accessToken", ""), values);
        toast.success("Password updated successfully!");
        resetForm();
        setIsEditingPassword(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to update password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    validatePassword(passwordFormik.values.newPassword ?? "");
  }, [passwordFormik.values.newPassword]);

  if (isLoadingUser) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={profileFormik.isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", m: 5 }}>
        {/* Floating Navigation */}
        <Box>
          <Card elevation={2} sx={{ display: "flex", flexDirection: "column", padding: 5, gap: 1, height: "auto", maxHeight: "none"}}>
            <Button
              onClick={() => setActiveTab("profile")}
              sx={{ padding: 0, textTransform: 'none', backgroundColor: 'transparent', 
                '&:hover': { backgroundColor: 'transparent', }}} > 
              <Typography variant="body1" sx={{ color: 'black', display: 'flex', alignItems: 'center', gap: 2 }}>
                User Profile
              </Typography>
            </Button>

            <Button
              onClick={() => setActiveTab("posts")}
              sx={{ padding: 0, textTransform: 'none', backgroundColor: 'transparent', 
                '&:hover': { backgroundColor: 'transparent', }}} > 
              <Typography variant="body1" sx={{ color: 'black', display: 'flex', alignItems: 'center', gap: 2 }}>
                User Posts
              </Typography>
            </Button>

            <Button
              onClick={() => setActiveTab("templates")}
              sx={{ padding: 0, textTransform: 'none', backgroundColor: 'transparent', 
                '&:hover': { backgroundColor: 'transparent', }}} > 
              <Typography variant="body1" sx={{ color: 'black', display: 'flex', alignItems: 'center', gap: 2 }}>
                User Templates
              </Typography>
            </Button>
          </Card>
        </Box>

        {activeTab === 'profile' && 
          <Box className="max-w-4xl mx-auto space-y-6">
            <Card
              elevation={2}
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
            >
              <CardContent className="py-6">
                <Grid container spacing={4} alignItems="center">
                  <Grid item>
                    <Box className="relative">
                      <Avatar
                        src={tempAvatarUrl || avatarUrl || ""}
                        className="w-24 h-24 border-4 border-white shadow-lg"
                      />
                      <IconButton
                        className="absolute bottom-0 right-0 bg-white hover:bg-gray-100"
                        size="small"
                        onClick={(event) =>
                          isEditingProfile && setAnchorEl(event.currentTarget)
                        }
                        disabled={!isEditingProfile}
                        sx={{ opacity: isEditingProfile ? 1 : 0.6 }}
                      >
                        <CameraAltIcon fontSize="small" className="text-blue-600" />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" className="font-bold">
                      {displayInfo.firstName} {displayInfo.lastName}
                    </Typography>
                    <Typography variant="subtitle1" className="opacity-90">
                      {displayInfo.email}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box className="space-x-2">
                      {isEditingProfile ? (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => {
                              setIsEditingProfile(false);
                              profileFormik.resetForm({
                                values: {
                                  ...profileFormik.initialValues,
                                  avatarId: user.avatarId,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  email: user.email,
                                  phoneNumber: user.phoneNumber,
                                },
                              });
                              setTempAvatarUrl(avatarUrl);
                            }}
                            className="bg-white text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => profileFormik.handleSubmit()}
                            className="bg-white text-blue-600 hover:bg-gray-100"
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditingProfile(true)}
                          className="bg-white text-blue-600 hover:bg-gray-100"
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>{" "}
            {/* Avatar Selection Dialog */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                className: "mt-2",
              }}
            >
              <Box className="p-4">
                <Typography
                  variant="subtitle1"
                  className="px-2 pb-2 text-gray-700 font-medium"
                >
                  Choose Avatar
                </Typography>
                <Divider className="mb-4" />
                {isLoadingAvatars ? (
                  <Box className="flex justify-center items-center p-4">
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <Grid container spacing={2} className="w-96">
                    {avatars.map((avatar) => (
                      <Grid item key={avatar.id}>
                        <Avatar
                          src={avatar.imagePath}
                          className={`w-20 h-20 cursor-pointer transition-all duration-300 ${
                            profileFormik.values.avatarId === avatar.id
                              ? "ring-4 ring-blue-500 scale-110"
                              : "hover:ring-2 hover:ring-blue-300"
                          }`}
                          onClick={() => {
                            if (isEditingProfile) {
                              profileFormik.setFieldValue("avatarId", avatar.id);
                              setTempAvatarUrl(avatar.imagePath);
                              setAnchorEl(null);
                            }
                          }}
                          sx={{
                            cursor: isEditingProfile ? "pointer" : "not-allowed",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Menu>
            {/* Personal Information Card */}
            <Card elevation={2}>
              <CardHeader
                title={
                  <Typography variant="h6" className="flex items-center gap-2">
                    <PersonIcon className="text-blue-500" />
                    Personal Information
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      disabled={!isEditingProfile}
                      {...profileFormik.getFieldProps("firstName")}
                      error={
                        profileFormik.touched.firstName &&
                        Boolean(profileFormik.errors.firstName)
                      }
                      helperText={
                        profileFormik.touched.firstName &&
                        profileFormik.errors.firstName
                      }
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      disabled={!isEditingProfile}
                      {...profileFormik.getFieldProps("lastName")}
                      error={
                        profileFormik.touched.lastName &&
                        Boolean(profileFormik.errors.lastName)
                      }
                      helperText={
                        profileFormik.touched.lastName &&
                        profileFormik.errors.lastName
                      }
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      disabled={!isEditingProfile}
                      {...profileFormik.getFieldProps("email")}
                      error={
                        profileFormik.touched.email &&
                        Boolean(profileFormik.errors.email)
                      }
                      helperText={
                        profileFormik.touched.email && profileFormik.errors.email
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      disabled={!isEditingProfile}
                      {...profileFormik.getFieldProps("phoneNumber")}
                      error={
                        profileFormik.touched.phoneNumber &&
                        Boolean(profileFormik.errors.phoneNumber)
                      }
                      helperText={
                        profileFormik.touched.phoneNumber &&
                        profileFormik.errors.phoneNumber
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      className="bg-white"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* Password Card */}
            <Card elevation={2}>
              <CardHeader
                title={
                  <Typography variant="h6" className="flex items-center gap-2">
                    <LockIcon className="text-blue-500" />
                    Password Settings
                  </Typography>
                }
                action={
                  !isEditingPassword && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditingPassword(true)}
                      className="border-blue-500 text-blue-500 hover:border-blue-600 hover:bg-blue-50"
                    >
                      Change Password
                    </Button>
                  )
                }
              />
              <Divider />
              <CardContent>
                {!isEditingPassword ? (
                  <Box className="flex items-center justify-between p-2">
                    <Box className="flex items-center gap-3">
                      <Box className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ShieldIcon className="text-blue-500" />
                      </Box>
                      <Box>
                        <Typography
                          variant="body1"
                          className="font-medium text-gray-900"
                        >
                          Password Protected
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                          Keep your account secure with a strong password
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Fade in={isEditingPassword}>
                    <Box className="space-y-4">
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showCurrentPassword ? "text" : "password"}
                        {...passwordFormik.getFieldProps("currentPassword")}
                        error={
                          passwordFormik.touched.currentPassword &&
                          Boolean(passwordFormik.errors.currentPassword)
                        }
                        helperText={
                          passwordFormik.touched.currentPassword &&
                          passwordFormik.errors.currentPassword
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                edge="end"
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        className="bg-white"
                      />

                      <TextField
                        fullWidth
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        {...passwordFormik.getFieldProps("newPassword")}
                        error={
                          passwordFormik.touched.newPassword &&
                          Boolean(passwordFormik.errors.newPassword)
                        }
                        helperText={
                          passwordFormik.touched.newPassword &&
                          passwordFormik.errors.newPassword
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        className="bg-white"
                      />

                      {/* Password Requirements */}
                      <Paper elevation={0} className="p-4 bg-gray-50">
                        <Typography
                          variant="subtitle2"
                          className="mb-2 text-gray-700"
                        >
                          Password Requirements
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box className="flex items-center gap-2">
                              <PasswordCheckListIcon passed={lowercase} />
                              <Typography
                                variant="body2"
                                className={`${lowercase ? "text-gray-700" : "text-gray-500"}`}
                              >
                                One lowercase letter
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box className="flex items-center gap-2">
                              <PasswordCheckListIcon passed={uppercase} />
                              <Typography
                                variant="body2"
                                className={`${uppercase ? "text-gray-700" : "text-gray-500"}`}
                              >
                                One uppercase letter
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box className="flex items-center gap-2">
                              <PasswordCheckListIcon passed={number} />
                              <Typography
                                variant="body2"
                                className={`${number ? "text-gray-700" : "text-gray-500"}`}
                              >
                                One number
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box className="flex items-center gap-2">
                              <PasswordCheckListIcon passed={length} />
                              <Typography
                                variant="body2"
                                className={`${length ? "text-gray-700" : "text-gray-500"}`}
                              >
                                8+ characters
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>

                      <Box className="flex justify-end gap-3 mt-4">
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsEditingPassword(false);
                            passwordFormik.setFieldValue("currentPassword", "");
                            passwordFormik.setFieldValue("newPassword", "");
                            setLowercase(false);
                            setUppercase(false);
                            setNumber(false);
                            setLength(false);
                          }}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setTempAvatarUrl(null);
                            passwordFormik.handleSubmit();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Update Password
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Box>
        }
        
        {activeTab === 'posts' && 
        <Box className="max-w-full mx-auto space-y-6"> <UserPosts/> </Box>}

        {activeTab === 'templates' && 
        <Box className="max-w-full mx-auto space-y-6"> <UserTemplates/> </Box>}
      </Box>
    </Box>
  );
}
