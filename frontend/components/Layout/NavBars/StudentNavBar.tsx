import HomeIcon from "@mui/icons-material/Home";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { UserCourseInformation } from "models/course.model";
import { UserDetails, getRoleText } from "models/user.model";
import { useUser } from "util/UserContext";
import NavBar, { Routes } from "./NavBar";
import UserDetailsSection from "./UserDetailSection";

type SideNavBarProps = {
  userDetails: UserDetails;
  routes?: Routes[];
  courseData?: UserCourseInformation;
};

export default function StudentNavBar({
  userDetails,
  routes,
  courseData,
}: SideNavBarProps): JSX.Element {
  const user = useUser();

  const handleOnClick = async () => {
    signOut(getAuth());
    if (user.setUserDetails !== null) {
      user.setUserDetails(null);
    }
  };
  console.log(courseData);
  const studentRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/",
      icon: <HomeIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...(courseData?.pages ?? []).map((x) => {
      return {
        name: x.title,
        route: `/course/${courseData?._id}/${x._id}`,
      };
    }),
  ];

  return (
    <div className="w-full">
      <div className="h-full fixed top-[0] left-[0] z-10 w-[13rem]">
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            <UserDetailsSection {...userDetails} />
            <NavBar
              routes={routes ?? studentRoutes}
              role={getRoleText(userDetails.role)}
              isCoursePage={false}
            />
          </div>
          <div className="flex justify-center items-center mb-5">
            {/* Bottom */}
            <Button variant="outlined" onClick={handleOnClick}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
