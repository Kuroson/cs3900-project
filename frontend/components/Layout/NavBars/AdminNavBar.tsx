import React from "react";
import { toast } from "react-toastify";
import AccessTime from "@mui/icons-material/AccessTime";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { UserCourseInformation } from "models/course.model";
import { UserDetails, getRoleText } from "models/user.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { createNewPage } from "util/api/pageApi";
import NavBar, { Routes } from "./NavBar";
import UserDetailsSection from "./UserDetailSection";

type AdminNavBar = {
  userDetails: UserDetails;
  routes?: Routes[];
  courseData?: UserCourseInformation;
  showAddPage?: boolean;
};

type CourseDetailsProps = {
  code: string;
};

const CourseDetails = ({ code }: CourseDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-3xl font-bold">{code.charAt(0) ?? ""}</span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full text-2xl">{code}</span>
      </div>
    </div>
  );
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  width: "400px",
};

export default function AdminNavBar({
  userDetails,
  courseData,
  routes,
  showAddPage,
}: AdminNavBar): JSX.Element {
  const user = useUser();
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [radio, setRadio] = React.useState("");
  const [pageName, setPageName] = React.useState("");

  // TODO: Only add the last courseData routes if courseData !== undefined
  const navRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/instructor",
      icon: <HomeIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    {
      name: "Home",
      route: `/instructor/${courseData?._id}`,
      icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Course Info",
      route: `/instructor/${courseData?._id}/settings`,
      icon: <SettingsIcon fontSize="large" color="primary" />,
    },
    {
      name: "Students",
      route: `/instructor/${courseData?._id}/students`,
      icon: <PeopleAltIcon fontSize="large" color="primary" />,
    },
    {
      name: "Schedule Lecture",
      route: `/instructor/${courseData?._id}/schedule`,
      icon: <AccessTime fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...(courseData?.pages ?? []).map((page) => {
      if (page.title === "Quiz") {
        return {
          name: page.title,
          route: `/instructor/${courseData?._id}/Quiz`,
        };
      } else if (page.title === "Assignment") {
        return {
          name: page.title,
          route: `/instructor/${courseData?._id}/Assignment`,
        };
      } else if (page.title === "Forum") {
        // TODO: forum route
        return {
          name: page.title,
          route: `/instructor/${courseData?._id}/Forum`,
        };
      } else if (page.title === "Analytics") {
        // TODO: analytics route
        return {
          name: page.title,
          route: `/instructor/${courseData?._id}/Analytics`,
        };
      } else if (page.title === "Workload Overview") {
        return {
          name: page.title,
          route: `/instructor/${courseData?._id}/WorkloadOverview`,
        };
      }
      return {
        name: page.title,
        route: `/instructor/${courseData?._id}/${page._id}`,
      };
    }),
  ];

  const [dynamicRoutes, setDynamicRoutes] = React.useState(routes ?? navRoutes);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadio((event.target as HTMLInputElement).value);
  };

  const handleOnClick = async () => {
    signOut(getAuth());
    if (user.setUserDetails !== null) {
      user.setUserDetails(null);
    }
  };

  const sendRequest = async (name: string) => {
    // Send to backend

    const [res, err] = await createNewPage(
      await authUser.getIdToken(),
      courseData?._id ?? "",
      name,
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
    }

    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    return res;
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.warn("here");
    // Add to page list
    if (radio === "Other Page") {
      const res = await sendRequest(pageName);
      setDynamicRoutes([
        ...dynamicRoutes,
        {
          name: pageName,
          route: `/instructor/${courseData?._id ?? "123"}/${res.pageId}`,
        },
      ]);
    } else {
      await sendRequest(radio);
      setDynamicRoutes([
        ...dynamicRoutes,
        {
          name: radio,
          route: `/instructor/${courseData?._id ?? "123"}/${radio.replace(" ", "")}`,
        },
      ]);
    }

    setPageName("");
    setRadio("");
    setOpen(false);
  };

  const routesNames = dynamicRoutes.map((route) => route.name);

  return (
    <div className="w-full">
      <div
        className="h-full fixed top-[0] left-[0] z-10 w-[13rem]"
        // 13rem matches Layout.module.scss
      >
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            {courseData === undefined && <UserDetailsSection {...userDetails} />}
            {courseData !== undefined && <CourseDetails code={courseData?.code ?? ""} />}
            <NavBar
              routes={dynamicRoutes}
              role={getRoleText(userDetails.role)}
              isCoursePage={false}
            />
            {showAddPage === true && (
              <div className="flex justify-center items-center w-full">
                <Button variant="outlined" onClick={handleOpen} id="addNewPage">
                  Add New Page
                </Button>
              </div>
            )}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <form onSubmit={handleOnSubmit}>
                <FormControl sx={style}>
                  <FormLabel id="add new page">Add new Page</FormLabel>
                  <RadioGroup
                    aria-labelledby="select new page"
                    defaultValue=""
                    name="new pages"
                    onChange={handleRadioChange}
                    value={radio}
                  >
                    <FormControlLabel
                      value="Assignment"
                      control={<Radio disabled={routesNames.includes("Assignment")} />}
                      label="Assignment"
                    />
                    <FormControlLabel
                      value="Quiz"
                      control={<Radio disabled={routesNames.includes("Quiz")} />}
                      label="Quiz"
                    />
                    <FormControlLabel
                      value="Forum"
                      control={<Radio disabled={routesNames.includes("Forum")} />}
                      label="Forum"
                    />
                    <FormControlLabel
                      value="Analytics"
                      control={<Radio disabled={routesNames.includes("Analytics")} />}
                      label="Analytics"
                    />
                    <FormControlLabel
                      value="Workload Overview"
                      control={<Radio disabled={routesNames.includes("Workload Overview")} />}
                      label="Workload Overview"
                    />
                    <FormControlLabel
                      id="RadioOtherPage"
                      value="Other Page"
                      control={<Radio />}
                      label="Other Page"
                    />
                    <TextField
                      disabled={radio !== "Other Page"}
                      id="OtherPageName"
                      label="Page Name"
                      variant="standard"
                      sx={{ marginLeft: "30px" }}
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                    />
                  </RadioGroup>
                  <Button
                    variant="contained"
                    sx={{ marginTop: "30px" }}
                    type="submit"
                    disabled={radio === "Other Page" && pageName === ""}
                  >
                    Add new page
                  </Button>
                </FormControl>
              </form>
            </Modal>
          </div>
          <div className="flex justify-center items-center mb-5">
            {/* Bottom */}
            <Button variant="outlined" onClick={handleOnClick} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
