import Link from "next/link";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import TitleWithIcon from "components/common/TitleWithIcon";

type SideNavBarProps = UserDetailsProps & {
  empty?: boolean;
  list: Routes[] // sidebar sections list
};

type UserDetailsProps = {
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  avatarURL?: string | null;
};

const UserDetails = ({ firstName, lastName, role, avatarURL }: UserDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 ml-5 flex flex-row">
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
};

const NavBar = ({routes}: {routes: Routes[]}): JSX.Element => {
  return (
    <div className="w-full flex flex-col mt-5">
      {routes?.map(({ name, route, Icon }, index) => {
        return (
          <Link
            key={`nav-index-${index}`}
            href={route}
            className="w-full flex justify-center py-2"
          >
            {/* <div className="w-full flex justify-items items-center">
              <span className="text-lg w-full text-center">{name}</span>
            </div> */}
            <TitleWithIcon text={name}>{Icon}</TitleWithIcon>
          </Link>
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
  list
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
          <div className="">
            {/* Top */}
            <UserDetails
              firstName={firstName}
              lastName={lastName}
              role={role}
              avatarURL={avatarURL}
            />
            <NavBar routes={list}/>
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
