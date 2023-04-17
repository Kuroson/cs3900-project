import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useUser } from "util/UserContext";
import { UserCourseInformation } from "models/course.model";
import { UserDetails, getRoleText } from "models/user.model";
import CourseDetails from "./CourseDetails";
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

  const studentRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/",
      icon: <HomeIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    {
      name: "Home",
      route: `/course/${courseData?._id}`, // TODO better case handling?
      icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Search",
      route: `/course/${courseData?._id}/search`,
      icon: <SearchIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...(courseData?.pages ?? []).map((page) => {
      if (page.title === "Quiz") {
        return {
          name: page.title,
          route: `/course/${courseData?._id}/Quiz`,
        };
      } else if (page.title === "Assignment") {
        return {
          name: page.title,
          route: `/course/${courseData?._id}/Assignment`,
        };
      } else if (page.title === "Forum") {
        // TODO: forum route
        return {
          name: page.title,
          route: `/course/${courseData?._id}/Forum`,
        };
      } else if (page.title === "Analytics") {
        return {
          name: page.title,
          route: `/course/${courseData?._id}/Analytics`,
        };
      } else if (page.title === "Workload Overview") {
        return {
          name: page.title,
          route: `/course/${courseData?._id}/WorkloadOverview`,
        };
      }
      return {
        name: page.title,
        route: `/course/${courseData?._id}/${page._id}`,
      };
    }),
  ];

  return (
    <div className="w-full">
      <div className="h-full fixed top-[0] left-[0] z-10 w-[13rem]">
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            {courseData === undefined && <UserDetailsSection {...userDetails} />}
            {courseData !== undefined && (
              <CourseDetails code={courseData?.code ?? ""} avatar={courseData.icon ?? ""} />
            )}
            <NavBar routes={routes ?? studentRoutes} role={getRoleText(userDetails.role)} />
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
