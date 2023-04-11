/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { useUser } from "util/UserContext";
import { CLIENT_BACKEND_URL } from "util/api/api";
import { Avatar, AvatarMap, getAvatars } from "util/api/avatarApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type MarketPlacePageProps = {
  avatars: Array<
    Omit<Avatar, "relativeURL"> & {
      url: string;
      name: string;
    }
  >;
};

const MarketPlacePage = ({ avatars }: MarketPlacePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails !== null);

  React.useEffect(() => {
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;
  console.log(avatars);
  return (
    <>
      <Head>
        <title>Marketplace page</title>
        <meta name="description" content="Marketplace page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">Market Place</span>
          </h1>
          <div>
            {avatars.map((avatar) => {
              return (
                <div key={avatar.name}>
                  <span>{avatar.name}</span>
                  <img src={avatar.url} alt={avatar.name} />
                  <span>{avatar.cost}</span>
                </div>
              );
            })}
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  const [res, err] = await getUserDetails(await AuthUser.getIdToken(), AuthUser.email ?? "", "ssr");

  if (res?.userDetails !== null && res?.userDetails.role === 0) {
    // Instructor
    return {
      redirect: {
        destination: "/instructor",
        permanent: false,
      },
    };
  }

  const [avatarRes, avatarErr] = await getAvatars(await AuthUser.getIdToken(), "ssr");

  const avatars = Object.entries(avatarRes?.avatarMap ?? {}).map(([key, value]) => {
    return {
      name: key,
      url: `${CLIENT_BACKEND_URL}/${value.relativeURL}`,
      cost: value.cost,
    };
  });

  return {
    props: {
      avatars: avatars,
    },
  };
});

export default withAuthUser<MarketPlacePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(MarketPlacePage);
