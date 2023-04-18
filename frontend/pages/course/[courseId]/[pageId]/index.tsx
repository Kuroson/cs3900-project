/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ImportContacts } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import TitleWithIcon from "components/common/TitleWithIcon";
import SingleStudentWeekSection from "components/workloadOverview/workload/SingleStudentWeekSection";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getFileDownloadLink } from "util/api/resourceApi";
import initAuth from "util/firebase";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";
import { FullWeekInterface } from "models/week.model";

initAuth(); // SSR maybe, i think...

type CoursePageProps = {
  courseData: UserCourseInformation;
  pageData: PageFull;
};

const FROG_IMAGE_URL =
  "https://i.natgeofe.com/k/8fa25ea4-6409-47fb-b3cc-4af8e0dc9616/red-eyed-tree-frog-on-leaves-3-2_3x2.jpg";

type ResourceDisplayProps = {
  resources: ResourceInterface[];
};

/**
 * Main Resource display
 */
const ResourcesDisplay = ({ resources }: ResourceDisplayProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full">
      {resources.map((resource) => {
        return (
          <div key={resource._id} className="w-full mb-5" data-cy={resource.title}>
            <span
              className="w-full text-xl font-medium flex flex-col"
              data-cy="resource-title"
            >{`${resource.title}`}</span>
            {/* Description */}
            {resource.description !== undefined && (
              <span data-cy="resource-description">{`${resource.description}`}</span>
            )}
            {/* Resource */}
            {resource.stored_name !== undefined && (
              <div className="my-5">
                {resource.file_type?.includes("image") ?? false ? (
                  <div>
                    <img
                      style={{ maxWidth: "30%" }}
                      src={resource.stored_name}
                      alt={resource.description}
                    />
                  </div>
                ) : (
                  <Link href={resource.stored_name} target="_blank">
                    <Button variant="contained">Download File</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Page for a course
 */
const CoursePage = ({ courseData, pageData }: CoursePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [dynamicWorkload, setDynamicWorkload] = React.useState<FullWeekInterface | undefined>(
    pageData.workload,
  );

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  React.useEffect(() => {
    setDynamicWorkload(pageData.workload);
  }, [pageData, courseData]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>{pageData.title}</title>
        <meta name="description" content="Course content page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-5">
            <span className="ml-4">{pageData.title}</span>
          </h1>

          {dynamicWorkload !== undefined && (
            <SingleStudentWeekSection
              courseId={courseData._id}
              weekId={dynamicWorkload._id}
              week={dynamicWorkload}
              studentId={user.userDetails._id}
            />
          )}

          {/* First list out all the base resources */}
          {pageData.resources.length !== 0 && (
            <div className="rounded-xl px-[2.5%] py-[2.5%] mb-5">
              <ResourcesDisplay resources={pageData.resources} />
            </div>
          )}

          {/* Then list out all the sections */}
          {pageData.sections.map((section) => {
            return (
              <div key={section._id}>
                <div className="w-full flex flex-col outline outline-[#F1F6EE] rounded-xl px-[2.5%] py-[2.5%] my-2">
                  <TitleWithIcon text={`Section: ${section.title}`}>
                    <ImportContacts color="primary" />
                  </TitleWithIcon>
                  <ResourcesDisplay resources={section.resources} />
                </div>
              </div>
            );
          })}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: CoursePageProps } | { notFound: true }> => {
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

  return {
    props: {
      pageData: page,
      courseData: courseDetails,
    },
  };
});

export default withAuthUser<CoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(CoursePage);
