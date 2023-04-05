import React from "react";
import Head from "next/head";
import { Button } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { OnlineClassFull } from "models/onlineClass.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import {
  AdminNavBar,
  ChatSection,
  ContentContainer,
  EditOnlineClassSection,
  EnableAndDisableChatButtons,
  Loading,
  OnlineClassVideoSection,
  StartAndEndClassButtons,
} from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type OnlineClassPageProps = {
  courseData: UserCourseInformation;
  onlineClassData: OnlineClassFull;
};

type LeftColumnProps = {
  dynamicOnlineClass: OnlineClassFull;
  setDynamicOnlineClass: React.Dispatch<React.SetStateAction<OnlineClassFull>>;
};

const LeftColumn = ({
  dynamicOnlineClass,
  setDynamicOnlineClass,
}: LeftColumnProps): JSX.Element => {
  const [editMode, setEditMode] = React.useState(true);

  React.useEffect(() => {
    if (editMode) {
      // On page change, set the edit mode to false
      setEditMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicOnlineClass]);

  return (
    <div className="w-full flex flex-col justify-center items-center px-[5%]">
      {editMode ? (
        <EditOnlineClassSection
          dynamicOnlineClass={dynamicOnlineClass}
          setDynamicOnlineClass={setDynamicOnlineClass}
          setEditMode={setEditMode}
        />
      ) : (
        <>
          <OnlineClassVideoSection dynamicOnlineClass={dynamicOnlineClass} />
          <StartAndEndClassButtons
            dynamicOnlineClass={dynamicOnlineClass}
            setDynamicOnlineClass={setDynamicOnlineClass}
          />
          <div className="pt-5">
            <Button variant="contained" onClick={() => setEditMode(true)}>
              Edit Online Class
            </Button>
          </div>
          <EnableAndDisableChatButtons
            dynamicOnlineClass={dynamicOnlineClass}
            setDynamicOnlineClass={setDynamicOnlineClass}
          />
        </>
      )}
    </div>
  );
};

type RightColumnProps = {
  dynamicOnlineClass: OnlineClassFull;
};

const RightColumn = ({ dynamicOnlineClass }: RightColumnProps): JSX.Element => {
  return <ChatSection dynamicOnlineClass={dynamicOnlineClass} />;
};

const OnlineClassPage = ({ courseData, onlineClassData }: OnlineClassPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  // Still need to fetch the chat messages for the online class data
  const [dynamicOnlineClass, setDynamicOnlineClass] = React.useState(onlineClassData);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%] pt-5 h-full">
          <div className="flex flex-row h-full">
            {/* Left col */}
            <div className="w-full">
              <LeftColumn
                dynamicOnlineClass={dynamicOnlineClass}
                setDynamicOnlineClass={setDynamicOnlineClass}
              />
            </div>
            {/* Right col */}
            <div className="w-full h-[90%]">
              <RightColumn dynamicOnlineClass={dynamicOnlineClass} />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<OnlineClassPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: OnlineClassPageProps } | { notFound: true }> => {
  const { courseId, onlineClass } = query;

  if (courseId === undefined || typeof courseId !== "string") {
    return { notFound: true };
  }

  const [courseDetails, courseDetailsErr] = await getUserCourseDetails(
    await AuthUser.getIdToken(),
    courseId as string,
    "ssr",
  );

  if (courseDetailsErr !== null) {
    console.error(courseDetailsErr);
    // handle error
    return { notFound: true };
  }
  if (courseDetails === null) throw new Error("This shouldn't have happened");

  const onlineClassData = courseDetails.onlineClasses.find((x) => x._id === onlineClass) as
    | OnlineClassFull
    | undefined;

  if (onlineClassData === undefined) return { notFound: true };

  onlineClassData.chatMessages = [];

  return { props: { courseData: courseDetails, onlineClassData: onlineClassData } };
});

export default withAuthUser<OnlineClassPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(OnlineClassPage);
