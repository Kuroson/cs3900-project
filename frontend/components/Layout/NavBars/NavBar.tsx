import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Divider } from "@mui/material";
import { RoleText } from "models/user.model";
import TitleWithIcon from "components/common/TitleWithIcon";

export type Routes = {
  name: string;
  route: string;
  icon?: React.ReactNode;
  hasLine?: boolean;
};

type NavBarProps = {
  routes: Routes[];
  isCoursePage: boolean;
  role: RoleText;
};

// NOTE This is different atm for student vs admin
export const defaultAdminRoutes: Routes[] = [
  { name: "Dashboard", route: "/instructor", icon: <HomeIcon fontSize="large" color="primary" /> },
  {
    name: "Admin allocation",
    route: "/instructor/instructor-allocation",
    icon: <SupervisorAccountIcon fontSize="large" color="primary" />,
  },
  {
    name: "Create Course",
    route: "/instructor/create-course",
    icon: <AddIcon fontSize="large" color="primary" />,
  },
];

const NavBar = ({ routes, isCoursePage, role }: NavBarProps): JSX.Element => {
  if (role === "Student") {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-4 pl-2">
        {routes.map(({ name, route, icon, hasLine }, index) => {
          return (
            <div key={`nav-index-${index}`} className="w-full flex py-2 flex-col">
              {/* TODO: href doesn't reload page and therefore doesn't call useEffect */}
              <Link href={route}>
                <TitleWithIcon text={name}>{icon}</TitleWithIcon>
              </Link>
              {(hasLine ?? false) && <Divider light sx={{ width: "100%", marginTop: "10px" }} />}
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-4 pl-2">
        {routes.map(({ name, route, icon, hasLine }, index) => {
          return (
            <div key={`nav-index-${index}`} className="w-full flex py-2 flex-col">
              {/* TODO: href doesn't reload page and therefore doesn't call useEffect */}
              <Link href={route}>
                <TitleWithIcon text={name}>{icon}</TitleWithIcon>
              </Link>
              {(hasLine ?? false) && <Divider light sx={{ width: "100%", marginTop: "10px" }} />}
            </div>
          );
        })}
      </div>
    );
  }
};

export default NavBar;
