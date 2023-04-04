import React from "react";
import Head from "next/head";
import { UserCourseInformation } from "models/course.model";
import { FullPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading, PostColumn, ThreadListColumn } from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type ForumPageProps = {
  courseData: UserCourseInformation;
};

const ForumPage = ({ courseData }: ForumPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedPost, setShowedPost] = React.useState<FullPostInfo | null>(null); // The current displayed Thread
  const [postList, setPostList] = React.useState([...courseData.forum.posts]);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  React.useEffect(() => {
    // Every time showPost gets updated, update in main postList
    if (showedPost !== null) {
      // Sort it so that it doesn't re-order
      const newList = [...postList.filter((x) => x._id !== showedPost._id), { ...showedPost }];
      setPostList([...newList.sort((a, b) => (a.timeCreated < b.timeCreated ? 1 : -1))]);
      // console.log([...newList.sort((a, b) => (a.timeCreated < b.timeCreated ? 1 : -1))]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showedPost]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="description" content="Create forum test" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-3">
            <span className="ml-4"></span>
          </h1>
        </div>
        <div className="flex w-full justify-left px-[2%]">
          {/* LEFT COLUMN */}
          <ThreadListColumn
            courseId={courseData._id}
            userDetails={userDetails}
            postList={postList}
            setPostList={setPostList}
            setShowedPost={setShowedPost}
          />
          {/* RIGHT COLUMN */}
          <PostColumn
            showedPost={showedPost}
            userDetails={userDetails}
            setShowedPost={setShowedPost}
          />
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ForumPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: ForumPageProps } | { notFound: true }> => {
  const { courseId } = query;

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

  return { props: { courseData: courseDetails } };
});

export default withAuthUser<ForumPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(ForumPage);
