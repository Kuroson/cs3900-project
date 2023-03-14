import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import ShowOrEditSectionT from "./ShowOrEditSectionT";

export enum Feature {
  EditSectionResource,
  EditResourceOut,
  RemoveSection,
  RemoveSectionResource,
  RemoveResourceOut,
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
      fileType: "",
      linkToResource: "",
    },
    {
      resourceId: "5",
      title: "file2",
      description: "hello 5 resource",
      fileType: "pdf",
      linkToResource: "pdf",
    },
    {
      resourceId: "6",
      title: "file3",
      description: "hello 6 resource",
      fileType: "pdf",
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
          fileType: "",
          linkToResource: "",
        },
        {
          resourceId: "5",
          title: "file2",
          description: "hello 5 resource",
          fileType: "pdf",
          linkToResource: "pdf",
        },
        {
          resourceId: "6",
          title: "file3",
          description: "hello 6 resource",
          fileType: "pdf",
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
  const [dataToBackend, setDateToBackend] = useState<PageType>();

  // remove linkToResource and fileType
  const pageDataToBackend = (data: PageType) => {
    // copy original data
    const copy = { ...data };
    const resources = copy.resources;
    const sections = copy.sections;
    // remove all linkToResource in resources and sections array
    const resourcesWithoutLink = resources.map(({ linkToResource, fileType, ...rest }) => rest);
    const sectionsWithoutLink = sections.map((section) => ({
      ...section,
      resources: section.resources.map(({ linkToResource, fileType, ...rest }) => rest),
    }));
    copy.resources = resourcesWithoutLink;
    copy.sections = sectionsWithoutLink;
    return copy;
  };

  useEffect(() => {
    // TODO: call /page/{courseId}/{pageId} api here, data is dataToBackend which without file
    console.log("send the whole data to backend ");
    console.log(dataToBackend);
  }, [dataToBackend]);

  // edit and remove each resource outside and inside of sections
  const handleEditResource = (resource: ResourcesType, feature: Feature, sectionId?: string) => {
    // change materials showing on the page
    setNewMaterials((prev) => {
      // const copy = pageDataToBackend(prev);
      const copy = { ...prev };
      if (feature === Feature.EditResourceOut || feature === Feature.RemoveResourceOut) {
        const oldResourceIndex = copy.resources.findIndex(
          (re) => re.resourceId === resource.resourceId,
        );
        if (feature === Feature.EditResourceOut) {
          // edit outside resource
          copy.resources.splice(oldResourceIndex, 1, resource);
        } else {
          // remove outside resource
          copy.resources.splice(oldResourceIndex, 1);
        }
      } else if (
        feature === Feature.EditSectionResource ||
        feature === Feature.RemoveSectionResource
      ) {
        // edit section resource
        const sectionIndex = copy.sections.findIndex((se) => se.sectionId === sectionId);
        const section = copy.sections[sectionIndex];
        const oldResourceIndex = section.resources.findIndex(
          (re) => re.resourceId === resource.resourceId,
        );
        if (feature === Feature.EditSectionResource) {
          section.resources.splice(oldResourceIndex, 1, resource);
          copy.sections[sectionIndex] = section;
        } else {
          section.resources.splice(oldResourceIndex, 1);
          copy.sections[sectionIndex] = section;
        }
      }

      // remove fileType and linkToResource
      setDateToBackend(pageDataToBackend(copy));
      return copy;
    });
  };

  const handleEditTitle = (newTitle: string, sectionId: string) => {
    // change materials showing on the page
    setNewMaterials((prev) => {
      // change section title
      const copy = prev;
      const getIdx = copy.sections.findIndex((se) => se.sectionId === sectionId);
      copy.sections[getIdx].title = newTitle;
      // remove fileType and linkToResource
      setDateToBackend(pageDataToBackend(copy));
      return copy;
    });
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
          />
        ))}
      </div>
      {/* Sections */}
      {newMaterials.sections.map((section, index) => (
        <div key={`section_${index}`}>
          <ShowOrEditSectionT
            title={section.title}
            sectionId={section.sectionId}
            handleEditTitle={handleEditTitle}
          />
          {newMaterials.sections.map((section, sectionidx) => (
            <div className="flex flex-col mb-4" key={`section_${sectionidx}`}>
              {section.resources.map((resource, resourceIdx) => (
                <ShowOrEditResource
                  resource={resource}
                  key={`${sectionidx}_${resourceIdx}`}
                  handleEditResource={handleEditResource}
                  sectionId={section.sectionId}
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
