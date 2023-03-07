import Link from "next/link";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";

type SideNavBarProps = {
  empty?: boolean;
};

export default function SideNavbar({ empty }: SideNavBarProps): JSX.Element {
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
            <Link href="/">
              <h1 className="text-2xl font-bold mt-4 px-4 py-2 text-center">Git Happens</h1>
            </Link>
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
