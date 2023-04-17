/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SavingsIcon from "@mui/icons-material/Savings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Card } from "@mui/material";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { CLIENT_BACKEND_URL } from "util/api/api";
import { Avatar, AvatarMap, buyAvatar, getAvatars } from "util/api/avatarApi";
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
  const [loading, setLoading] = useState(user.userDetails !== null);

  useEffect(() => {
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  // Re-render stuff on load
  useEffect(() => {
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
    if (user.userDetails !== null) {
      fetchUserData().then((res) => user.setUserDetails(res.userDetails));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", icon: <HomeIcon fontSize="large" color="primary" /> },
    {
      name: "Marketplace",
      route: "/marketplace",
      icon: <StorefrontIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...userDetails.enrolments.map((x) => {
      return {
        name: x.course.code,
        route: `/course/${x.course._id}`,
      };
    }),
  ];

  const handleBuyAvatar = async (avatar: string, cost: number) => {
    const [res, err] = await buyAvatar(await authUser.getIdToken(), avatar, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Doesn't have enough kudos");
      }
      return;
    }
    toast.success("Bought avatar successfully");
    user.setUserDetails((prev) => {
      if (prev === null) return null;
      return { ...prev, avatar: avatar, kudos: prev.kudos - cost };
    });
  };

  return (
    <>
      <Head>
        <title>Marketplace page</title>
        <meta name="description" content="Marketplace page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} routes={studentRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <PageHeader title="Marketplace">
            <Card className="flex items-center rounded-md px-4 gap-2">
              <SavingsIcon sx={{ color: "#ffc400" }} />
              <h6>{user.userDetails.kudos}</h6>
            </Card>
          </PageHeader>
          <div className="flex flex-col items-center mt-6 gap-8">
            <img
              src={`${CLIENT_BACKEND_URL}/public/avatars/${user.userDetails.avatar}.svg`}
              className="h-[150px] w-[150px] rounded-full"
              alt="self avatar"
            />
            <div className="flex flex-wrap gap-10">
              {avatars.map((avatar) => {
                return (
                  <div
                    key={avatar.name}
                    className="flex flex-col items-center gap-2 hover:cursor-pointer group w-[80px] h-[80px] "
                    onClick={() => handleBuyAvatar(avatar.name, avatar.cost)}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="h-[70px] w-[70px] rounded-full group-hover:h-[72px] group-hover:w-[72px] group-hover:drop-shadow-xl"
                    />
                    <span className="flex items-center group-hover:font-bold">
                      <MonetizationOnIcon sx={{ color: "#ffc400" }} />
                      <p>{avatar.cost}</p>
                    </span>
                  </div>
                );
              })}
            </div>
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
