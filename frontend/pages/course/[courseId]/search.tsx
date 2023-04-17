/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import Link from "next/link";
import FolderIcon from "@mui/icons-material/Folder";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { Button, TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getFileDownloadLink } from "util/api/resourceApi";
import initAuth from "util/firebase";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";

initAuth();

type CourseResourceSearchPageProps = {
  courseData: UserCourseInformation;
  resourceItems: ResourceItem[];
};

interface ResourceItem extends ResourceInterface {
  section: string | null;
  page: string;
}

type ResourceItemRowProps = {
  resourceItem: ResourceItem;
};

const ResourceItemRow = ({ resourceItem }: ResourceItemRowProps): JSX.Element => {
  const Icon = (): JSX.Element => {
    if (resourceItem.section !== null) {
      return <FolderIcon />;
    }
    return <ImportContactsIcon />;
  };

  return (
    <div className="w-full py-3 ">
      <div className="text-xl flex justify-items items-center font-semibold">
        <Icon />
        <span className="pl-2">{resourceItem.title}</span>
      </div>
      <div className="w-full">
        <span className="text-sm">{resourceItem.description}</span>
        <div className="my-2">
          {resourceItem.stored_name !== undefined && (
            <div className="my-5">
              {resourceItem.file_type?.includes("image") ?? false ? (
                <div>
                  <img
                    style={{ maxWidth: "30%" }}
                    src={resourceItem.stored_name}
                    alt={resourceItem.description}
                  />
                </div>
              ) : (
                <Link href={resourceItem.stored_name} target="_blank">
                  <Button variant="contained">Download File</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Base page for a course for a student
 * Course data is SSR
 */
const CourseResourceSearchPage = ({
  courseData,
  resourceItems,
}: CourseResourceSearchPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [dynamicResourceItems, setDynamicResourceItems] = React.useState(resourceItems);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDynamicResourceItems([
        ...resourceItems.filter((x) => x.title.toLowerCase().includes(search.toLowerCase())),
      ]);
    }
  };

  return (
    <>
      <Head>
        <title>{`${courseData.code} ${courseData.session}`}</title>
        <meta name="description" content={courseData.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">Search For Resources</span>
          </h1>
          <div className="flex flex-col pt-3 px-[2%] justify-center">
            <div className="w-full flex justify-end pt-3 pb-4">
              <TextField
                id="search-resource"
                label="Search For Resource Title"
                variant="outlined"
                sx={{ width: "300px" }}
                onKeyDown={handleKeyDown}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <div className="overflow-y-auto h-[800px]">
              {dynamicResourceItems.map((x) => {
                return <ResourceItemRow key={x._id} resourceItem={x} />;
              })}
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CourseResourceSearchPageProps> =
  withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  })(
    async ({
      AuthUser,
      query,
    }): Promise<{ props: CourseResourceSearchPageProps } | { notFound: true }> => {
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

      const pageList: PageFull[] = [];

      const promiseList = courseDetails.pages.map(async (page) => {
        // Fetch link for resources
        page.resources = await parseResource(page.resources);

        // Now for each section
        for (const section of page.sections) {
          section.resources = await parseResource(section.resources);
        }
        pageList.push(page);
      });

      await Promise.all(promiseList);

      const resourceItems: ResourceItem[] = [];

      for (const page of pageList) {
        for (const resource of page.resources) {
          resourceItems.push({ ...resource, section: null, page: page.title });
        }
        for (const section of page.sections) {
          for (const resource of section.resources) {
            resourceItems.push({
              ...resource,
              section: section.title,
              page: page.title,
            });
          }
        }
      }

      return { props: { courseData: courseDetails, resourceItems } };
    },
  );

export default withAuthUser<CourseResourceSearchPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(CourseResourceSearchPage);
