import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Button, Divider } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import TitleWithIcon from "components/common/TitleWithIcon";

type SideNavBarProps = UserDetailsProps & {
  empty?: boolean;
  list: Routes[]; // sidebar sections list
  isCoursePage?: boolean; // check if the current page is course page
  courseCode?: string;
  courseIcon?: string;
};

type UserDetailsProps = {
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  avatarURL?: string | null;
};

const UserDetails = ({ firstName, lastName, role, avatarURL }: UserDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-2xl font-bold">
          {(firstName?.charAt(0) ?? "") + (lastName?.charAt(0) ?? "")}
        </span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${firstName} ${lastName}`}</span>
        <span className="text-start w-full">{role}</span>
      </div>
    </div>
  );
};

export type Routes = {
  name: string;
  route: string;
  Icon?: React.ReactNode;
  hasLine?: boolean;
};

const NavBar = ({ routes }: { routes: Routes[] }): JSX.Element => {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 pl-2">
      {routes?.map(({ name, route, Icon, hasLine }, index) => {
        return (
          <>
            <Link key={`nav-index-${index}`} href={route} className="w-full flex py-2">
              <TitleWithIcon text={name}>{Icon}</TitleWithIcon>
            </Link>
            {(hasLine ?? false) && <Divider light sx={{ marginLeft: "10px", width: "100%" }} />}
          </>
        );
      })}
    </div>
  );
};

export default function SideNavbar({
  empty,
  firstName,
  lastName,
  role,
  avatarURL,
  list,
  isCoursePage,
  courseCode,
  courseIcon,
}: SideNavBarProps): JSX.Element {
  if (empty === true) {
    return <div></div>;
  }

  const handleOnClick = async () => {
    signOut(getAuth());
  };

  return (
    <div className="w-full">
      <div
        className="h-full fixed top-[0] left-[0] z-10 w-[13rem]"
        // 13rem matches Layout.module.scss
      >
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            {isCoursePage ?? false ? (
              <div className="flex flex-col items-center justify-center gap-2 my-2">
                <Link href="/admin" className="mr-8">
                  <TitleWithIcon text="Dashborad">
                    <ArrowBackIosIcon />
                  </TitleWithIcon>
                </Link>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={courseIcon ?? "" ? courseIcon : "/static/images/avatar/3.jpg"}
                    alt="Course Icon"
                  />
                  <h2>{courseCode}</h2>
                </div>
              </div>
            ) : (
              <UserDetails
                firstName={firstName}
                lastName={lastName}
                role={role}
                avatarURL={avatarURL}
              />
            )}
            <NavBar routes={list} />
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
