import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Divider } from "@mui/material";
import TitleWithIcon from "components/common/TitleWithIcon";
import { RoleText } from "models/user.model";

export type Routes = {
  name: string;
  route: string;
  icon?: React.ReactNode;
  hasLine?: boolean;
};

type NavBarProps = {
  routes: Routes[];
  role: RoleText;
};

// NOTE This is different atm for student vs admin
export const defaultAdminRoutes: Routes[] = [
  { name: "Dashboard", route: "/instructor", icon: <HomeIcon fontSize="large" color="primary" /> },
  {
    name: "Instructor allocation",
    route: "/instructor/instructor-allocation",
    icon: <SupervisorAccountIcon fontSize="large" color="primary" />,
  },
  {
    name: "Create Course",
    route: "/instructor/create-course",
    icon: <AddIcon fontSize="large" color="primary" />,
  },
];

const NavBar = ({ routes, role }: NavBarProps): JSX.Element => {
  return (
    <div
      className="w-full flex flex-col items-center ml-2 mt-3 h-[600px] overflow-scroll"
      id="navbar"
    >
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
};

export default NavBar;
