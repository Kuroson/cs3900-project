import React from "react";
import { toast } from "react-toastify";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "next-firebase-auth";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";

type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Layout({ children, className }: LayoutProps): JSX.Element {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    // Build user data for user context
    const fetchUserData = async () => {
      const [resUserData, errUserData] = await getUserDetails(
        await authUser.getIdToken(),
        authUser.email ?? "bad",
        "client",
      );

      if (errUserData !== null) {
        throw errUserData;
      }

      if (resUserData === null) throw new Error("This shouldn't have happened");
      return resUserData;
    };

    if (!user.userCreationMode && user.userDetails === null && authUser.id !== null) {
      // Only fetch data if we are not in creation mode and we have a user
      console.log("Fetching initial user data");
      fetchUserData()
        .then((res) => {
          console.log("fetched");
          if (user.setUserDetails !== undefined) {
            user.setUserDetails(res.userDetails);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          signOut(getAuth());
          toast.error("failed to fetch shit");
        });
    } else {
      console.log("Did not need to fetch. Not logged in");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, user.userCreationMode]);

  return <div className={className}>{children}</div>;
}
