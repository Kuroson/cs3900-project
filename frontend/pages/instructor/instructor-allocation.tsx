import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { UserDetails } from "models/user.model";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

const InstructorAllocationPage = (): JSX.Element => {
  const user = useUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  // const allCourses = courses;
  const authUser = useAuthUser();
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

    if (user.userDetails === null) {
      fetchUserData()
        .then((res) => {
          if (user.setUserDetails !== undefined) {
            user.setUserDetails(res.userDetails);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          toast.error("failed to fetch shit");
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <div>Loading...</div>;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Admin Allocation page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={defaultAdminRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-4">
            <span className="ml-4">
              Welcome, {`${userDetails.first_name} ${userDetails.last_name}`}
            </span>
          </h1>
          <p> TODO</p>
        </div>
      </ContentContainer>
    </>
  );
};

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(InstructorAllocationPage);
