import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";
import { FullWeekInterface } from "models/week.model";
import { FullWorkloadInfo } from "models/workload.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import {
  AddNewSection,
  AdminNavBar,
  ContentContainer,
  Loading,
  PageSections,
  ResourcesSection,
} from "components";
import AddNewWorkloadSection from "components/admin/workload/AddNewWeekSection";
import SingleEditableWeekSection from "components/admin/workload/SingleEditableWeekSection";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { deletePage } from "util/api/pageApi";
import { getFileDownloadLink } from "util/api/resourceApi";
import { getWorkload } from "util/api/workloadApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";

initAuth(); // SSR maybe, i think...

type AdminCoursePageProps = {
  courseData: UserCourseInformation;
  pageData: PageFull;
  workloadData: FullWorkloadInfo;
};

const AdminCoursePage = ({
  courseData,
  pageData,
  workloadData,
}: AdminCoursePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  // const [dynamicPageData, setDynamicPageData] = React.useState(pageData);
  const [dynamicResources, setDynamicResources] = React.useState(pageData.resources);
  const [dynamicSections, setDynamicSections] = React.useState(pageData.sections);
  const [dynamicWeeks, setDynamicWeeks] = React.useState(workloadData.weeks);
  const [dynamicWorkload, setDynamicWorkload] = React.useState<FullWeekInterface | undefined>(
    pageData.workload,
  );
  const [dynamicOnlineClasses, setDynamicOnlineClasses] = React.useState(courseData.onlineClasses);

  React.useEffect(() => {
    // Trigger a re-render when pageData props change from server
    setDynamicResources(pageData.resources);
    setDynamicSections(pageData.sections);
    setDynamicWeeks(workloadData.weeks);
    setDynamicWorkload(pageData.workload);
    setDynamicOnlineClasses(courseData.onlineClasses);
  }, [pageData, workloadData, courseData]);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const handleDeletePage = async () => {
    const [data, err] = await deletePage(
      await authUser.getIdToken(),
      courseData._id,
      pageData._id,
      "client",
    );
    if (err !== null) {
      console.error(err);
    }
    router.push(`/instructor/${courseData._id}`);
  };

  console.log("THIS is " + dynamicWorkload);
  console.log(pageData);

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-3">
            <div className="flex items-center gap-4">
              <span className="ml-4">{pageData.title}</span>
            </div>
            <Button
              color="error"
              onClick={handleDeletePage}
              startIcon={<DeleteIcon />}
              id="deletePageButton"
            >
              Delete page
            </Button>
          </h1>
          {dynamicWorkload === undefined ? (
            <AddNewWorkloadSection
              courseId={courseData._id}
              pageId={pageData._id}
              setWeeks={setDynamicWeeks}
              weeks={dynamicWeeks}
              setWeek={setDynamicWorkload}
            />
          ) : (
            <SingleEditableWeekSection
              courseId={courseData._id}
              setWeeks={setDynamicWeeks}
              weeks={dynamicWeeks}
              week={dynamicWorkload}
              setWeek={setDynamicWorkload}
              onlineClasses={dynamicOnlineClasses}
              setOnlineClasses={setDynamicOnlineClasses}
            />
          )}
          <ResourcesSection
            resources={dynamicResources}
            setResources={setDynamicResources}
            pageId={pageData._id}
            courseId={courseData._id}
            sectionId={null}
          />
          <PageSections
            sections={dynamicSections}
            setSections={setDynamicSections}
            pageId={pageData._id}
            courseId={courseData._id}
          />
          <AddNewSection
            sections={dynamicSections}
            setSections={setDynamicSections}
            pageId={pageData._id}
            courseId={courseData._id}
          />
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AdminCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AdminCoursePageProps } | { notFound: true }> => {
  /**
   * Parse the resource and fetch links if they require it
   * @returns
   */
  const parseResource = async (
    originalResources: ResourceInterface[],
  ): Promise<ResourceInterface[]> => {
    const parsedResources: ResourceInterface[] = [];
    const resourcesPromises = originalResources.map(async (resource) => {
      if (resource.file_type !== undefined && resource.file_type !== null) {
        // Its a file
        const [link, linkErr] = await getFileDownloadLink(
          await AuthUser.getIdToken(),
          resource._id,
          "ssr",
        );

        if (link !== null) {
          parsedResources.push({
            ...resource,
            stored_name: link.linkToFile,
            file_type: link.fileType,
          });
        }
      } else {
        parsedResources.push(resource);
      }
    });

    await Promise.all(resourcesPromises);
    return parsedResources;
  };

  const { courseId, pageId } = query;
  if (
    courseId === undefined ||
    typeof courseId !== "string" ||
    pageId === undefined ||
    typeof pageId !== "string"
  ) {
    return { notFound: true };
  }

  if (!(await adminRouteAccess(await AuthUser.getIdToken(), AuthUser.email ?? ""))) {
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
  const page = courseDetails.pages.find((page) => page._id === pageId);
  if (page === undefined) return { notFound: true };

  // Fetch link for resources
  page.resources = await parseResource(page.resources);

  // Now for each section
  for (const section of page.sections) {
    section.resources = await parseResource(section.resources);
  }

  const [workloadDetails, workloadError] = await getWorkload(
    await AuthUser.getIdToken(),
    courseId as string,
    "ssr",
  );

  if (workloadError !== null) {
    console.error(workloadError);
    // handle error
    return { notFound: true };
  }

  if (workloadDetails === null) throw new Error("This shouldn't have happened");

  return {
    props: {
      pageData: page,
      courseData: courseDetails,
      workloadData: workloadDetails.workload,
    },
  };
});

export default withAuthUser<AdminCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(AdminCoursePage);
