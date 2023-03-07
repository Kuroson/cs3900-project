import Link from "next/link";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";

type SideNavBarProps = UserDetailsProps & {
  empty?: boolean;
};

type UserDetailsProps = {
  fullName?: string;
  role?: string;
  avatarURL?: string;
};

const UserDetails = ({ fullName, role, avatarURL }: UserDetailsProps): JSX.Element => {
  return (
    <div className="outline mt-5 ml-5 flex flex-row">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full">{/* Avatar here */}</div>
      <div className="flex flex-col pl-2">
        <span className="font-bold">{fullName}</span>
        <span>{role}</span>
      </div>
    </div>
  );
};

export default function SideNavbar({
  empty,
  fullName,
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
            <UserDetails fullName={fullName} role={role} avatarURL={avatarURL} />
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
