import React, { useEffect, useState } from "react";
import { Button, Divider } from "@mui/material";
import { PageType, ResourcesType, SectionsType } from "pages/admin/[courseId]/[pageId]";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import AddResource from "./AddResource";
import AddSection from "./AddSection";
import ShowOrEditSectionT from "./ShowOrEditSectionT";

export enum Feature {
  EditSectionResource,
  EditResourceOut,
  RemoveSection,
  RemoveSectionResource,
  RemoveResourceOut,
  EditSectionTitle,
  AddResourceOut,
  AddSection,
  AddSectionResource,
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
  console.log("🚀 ~ file: ShowOrEditPage.tsx:84 ~ newMaterials:", newMaterials);
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

  // edit title and remove section
  const handleEditTitle = (newTitle: string, sectionId: string, feature: Feature) => {
    // change materials showing on the page
    setNewMaterials((prev) => {
      const copy = { ...prev };
      const getIdx = copy.sections.findIndex((se) => se.sectionId === sectionId);
      if (feature === Feature.EditSectionTitle) {
        // change section title
        copy.sections[getIdx].title = newTitle;
      } else {
        // remove section
        copy.sections.splice(getIdx, 1);
      }

      // remove fileType and linkToResource
      setDateToBackend(pageDataToBackend(copy));
      return copy;
    });
  };

  const handleAddResource = (
    feature: Feature,
    newResource?: ResourcesType,
    newSection?: SectionsType,
    sectionId?: string,
  ) => {
    setNewMaterials((prev) => {
      console.log(newSection);
      const copy = { ...prev };
      if (feature === Feature.AddResourceOut && newResource) {
        copy.resources.push(newResource);
      } else if (feature === Feature.AddSection && newSection) {
        copy.sections.push(newSection);
      } else if (feature === Feature.AddSectionResource && newResource) {
        const idx = copy.sections.findIndex((se) => se.sectionId === sectionId);
        copy.sections[idx].resources.push(newResource);
      }
      return copy;
    });
  };

  return (
    <>
      {/* Resources outside*/}
      <div className="flex flex-col mb-7">
        {newMaterials.resources.map((resource, index) => (
          <ShowOrEditResource
            resource={resource}
            key={`resource_out_${index}`}
            handleEditResource={handleEditResource}
          />
        ))}
        <AddResource handleAddResource={handleAddResource} />
      </div>
      {/* Sections */}
      {newMaterials.sections.map((section, index) => (
        <div key={`section_${index}`} className="mb-7">
          <Divider />
          <ShowOrEditSectionT
            title={section.title}
            sectionId={section.sectionId ?? ""}
            handleEditTitle={handleEditTitle}
          />
          {section.resources.map((resource, resourceIdx) => (
            <ShowOrEditResource
              resource={resource}
              key={`${index}_${resourceIdx}`}
              handleEditResource={handleEditResource}
              sectionId={section.sectionId}
            />
          ))}
          <AddResource handleAddResource={handleAddResource} sectionId={section.sectionId} />
        </div>
      ))}
      <Divider />
      <AddSection handleAddResource={handleAddResource} />
    </>
  );
};

export default ShowOrEditPage;
