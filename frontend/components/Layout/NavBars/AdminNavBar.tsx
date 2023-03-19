import React from "react";
import { toast } from "react-toastify";
import LogoutIcon from "@mui/icons-material/Logout";
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

type AdminNavBar = {
  userDetails: UserDetails;
  routes: Routes[];
  courseData?: UserCourseInformation;
  showAddPage?: boolean;
};

/**
 * User avatar
 */
const UserDetailSection = ({ first_name, last_name, role, avatar }: UserDetails): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-2xl font-bold">
          {(first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "")}
        </span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${first_name} ${last_name}`}</span>
        <span className="text-start w-full">{getRoleText(role)}</span>
      </div>
    </div>
  );
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
  routes,
  courseData,
  showAddPage,
}: AdminNavBar): JSX.Element {
  const user = useUser();
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [radio, setRadio] = React.useState("");
  const [pageName, setPageName] = React.useState("");
  const [dynamicRoutes, setDynamicRoutes] = React.useState(routes);

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
      pageName,
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
    // TODO do the rest later
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
      // TODO
      // sendRequest(radio);
      // routes.push({
      //   name: pageName,
      //   route: `/instructor/${courseId}`,
      // });
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
            {courseData === undefined && <UserDetailSection {...userDetails} />}
            {courseData !== undefined && <CourseDetails code={courseData?.code ?? ""} />}
            <NavBar
              routes={dynamicRoutes}
              role={getRoleText(userDetails.role)}
              isCoursePage={false}
            />
            {showAddPage === true && (
              <div className="flex justify-center items-center w-full">
                <Button variant="outlined" onClick={handleOpen}>
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
                    <FormControlLabel value="Other Page" control={<Radio />} label="Other Page" />
                    <TextField
                      disabled={radio !== "Other Page"}
                      id="Page Name"
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
