import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import StorefrontIcon from "@mui/icons-material/Storefront";
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
      name: "Marketplace",
      route: "/", //TODO
      icon: <StorefrontIcon fontSize="large" color="primary" />,
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
          route: `/course/${courseData?._id}/Forum`, //TODO
        };
      } else if (page.title === "Analytics") {
        return {
          name: page.title,
          route: `/course/${courseData?._id}/Analytics`,
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
            {courseData !== undefined && <CourseDetails code={courseData?.code ?? ""} />}
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
