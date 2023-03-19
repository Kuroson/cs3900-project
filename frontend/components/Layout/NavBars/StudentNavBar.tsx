import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { UserDetails, getRoleText } from "models/user.model";
import { useUser } from "util/UserContext";
import NavBar, { Routes } from "./NavBar";

type SideNavBarProps = {
  userDetails: UserDetails;
  routes: Routes[];
};

/**
 * User avatar
 */
const UserDetailsSection = ({ first_name, last_name, role, avatar }: UserDetails): JSX.Element => {
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

export default function StudentNavBar({ userDetails, routes }: SideNavBarProps): JSX.Element {
  const user = useUser();

  const handleOnClick = async () => {
    signOut(getAuth());
    if (user.setUserDetails !== null) {
      user.setUserDetails(null);
    }
  };

  return (
    <div className="w-full">
      <div className="h-full fixed top-[0] left-[0] z-10 w-[13rem]">
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            <UserDetailsSection {...userDetails} />
            <NavBar routes={routes} role={getRoleText(userDetails.role)} isCoursePage={false} />
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
