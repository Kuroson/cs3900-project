import Link from "next/link";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";

type SideNavBarProps = UserDetailsProps & {
  empty?: boolean;
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
        <span className="text-2xl font-bold">AC</span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${firstName} ${lastName}`}</span>
        <span className="text-start w-full">{role}</span>
      </div>
    </div>
  );
};

export default function SideNavbar({
  empty,
  firstName,
  lastName,
  role,
  avatarURL,
}: SideNavBarProps): JSX.Element {
  if (empty === true) {
    return <div></div>;
  }

  const handleOnClick = async () => {
    signOut(getAuth());
  };

  return (
    <div className="bg-blue-primary w-full">
      <div
        className="h-full fixed top-[0] left-[0] z-10 w-[13rem]"
        // 13rem matches Layout.module.scss
      >
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            <UserDetails
              firstName={firstName}
              lastName={lastName}
              role={role}
              avatarURL={avatarURL}
            />
          </div>
          <div className="flex justify-center items-center mb-5">
            {/* Bottom */}
            <Button variant="contained" onClick={handleOnClick}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
