import React, { useState } from "react";
import { Button } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import ShowOrEditSectionT from "./ShowOrEditSectionT";

export enum EditPosition {
  SectionResource,
  SectionTitle,
  ResourceOut,
}

const defaultM: PageType = {
  title: "resource1",
  courseId: "1",
  pageId: "2",
  resources: [
    {
      resourceId: "3",
      title: "file1",
      description: "",
      type: "",
      linkToResource: "",
    },
    {
      resourceId: "5",
      title: "file2",
      description: "hello 5 resource",
      type: "pdf",
      linkToResource: "pdf",
    },
    {
      resourceId: "6",
      title: "file3",
      description: "hello 6 resource",
      type: "pdf",
      linkToResource: "pdf",
    },
  ],
  sections: [
    {
      sectionId: "123",
      title: "Monday",
      resources: [
        {
          resourceId: "3",
          title: "sectionfile1",
          description: "",
          type: "",
          linkToResource: "",
        },
        {
          resourceId: "5",
          title: "file2",
          description: "hello 5 resource",
          type: "pdf",
          linkToResource: "pdf",
        },
        {
          resourceId: "6",
          title: "file3",
          description: "hello 6 resource",
          type: "pdf",
          linkToResource: "pdf",
        },
      ],
    },
  ],
};

const ShowOrEditPage: React.FC<{
  pageInfo: PageType;
}> = ({ pageInfo }) => {
  // TODO: replace to pageInfo
  const [newMaterials, setNewMaterials] = useState<PageType>(defaultM);

  const pageDataToBackend = (data: PageType) => {
    // copy original data
    const copy = { ...data };
    const resources = copy.resources;
    const sections = copy.sections;
    // remove all linkToResource in resources and sections array
    const resourcesWithoutLink = resources.map(({ linkToResource, ...rest }) => rest);
    const sectionsWithoutLink = sections.map((section) => ({
      ...section,
      resources: section.resources.map(({ linkToResource, ...rest }) => rest),
    }));
    copy.resources = resourcesWithoutLink;
    copy.sections = sectionsWithoutLink;
    return copy;
  };

  // edit each resource outside of sections
  const handleEditResource = (
    newResource: ResourcesType,
    position: EditPosition = EditPosition.SectionTitle,
  ) => {
    setNewMaterials((prev) => {
      const copy = pageDataToBackend(prev);
      // replace newResource
      const oldResourceIndex = copy.resources.findIndex(
        (re) => re.resourceId === newResource.resourceId,
      );
      copy.resources.splice(oldResourceIndex, 1, newResource);

      return copy;
    });
    // TODO: call /page/{courseId}/{pageId} api here
    console.log("send the whole data to backend");
  };

  return (
    <>
      {/* Resources outside*/}
      <div className="flex flex-col mb-4">
        {newMaterials.resources.map((resource, index) => (
          <ShowOrEditResource
            resource={resource}
            key={`resource_out_${index}`}
            handleEditResource={handleEditResource}
            inSection={false}
          />
        ))}
      </div>
      {/* Sections */}
      {newMaterials.sections.map((section, index) => (
        <div key={`section_${index}`}>
          <ShowOrEditSectionT title={section.title} handleEditResource={handleEditResource} />
          {newMaterials.sections.map((section, sectionidx) => (
            <div className="flex flex-col mb-4" key={`section_${sectionidx}`}>
              {section.resources.map((resource, resourceIdx) => (
                <ShowOrEditResource
                  resource={resource}
                  key={`${sectionidx}_${resourceIdx}`}
                  handleEditResource={handleEditResource}
                  inSection={true}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default ShowOrEditPage;
