import React, { useEffect, useState } from "react";
import { Button, Divider } from "@mui/material";
import { AuthUserContext } from "next-firebase-auth";
import { PageType, ResourcesType, SectionsType } from "pages/admin/[courseId]/[pageId]";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import { PROCESS_BACKEND_URL, apiDelete, apiPost, apiPut } from "util/api";
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

const ShowOrEditPage: React.FC<{
  pageInfo: PageType;
  courseId: string;
  authUser: AuthUserContext;
}> = ({ pageInfo, courseId, authUser }) => {
  const [newMaterials, setNewMaterials] = useState<PageType>(pageInfo);
  const RESOURCE_URL = `${PROCESS_BACKEND_URL}/page/${courseId}/${pageInfo.pageId}/resource`;
  const SECTION_URL = `${PROCESS_BACKEND_URL}/page/${courseId}/${pageInfo.pageId}/section`;

  useEffect(() => {
    setNewMaterials(pageInfo);
  }, [pageInfo]);

  // edit and remove each resource outside and inside of sections
  const handleEditResource = async (
    resource: ResourcesType,
    feature: Feature,
    sectionId?: string,
  ) => {
    // change materials showing on the page
    setNewMaterials((prev) => {
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
      return copy;
    });

    // update in backend
    if (feature === Feature.EditResourceOut) {
      const body = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: resource.title,
        description: resource.description,
        resourceId: resource.resourceId,
      };
      await sendToBackend(body, RESOURCE_URL);
    } else if (feature === Feature.EditSectionResource) {
      const body = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: resource?.title,
        description: resource?.description,
        sectionId: sectionId,
        resourceId: resource.resourceId,
      };
      await sendToBackend(body, RESOURCE_URL);
    } else if (feature === Feature.RemoveResourceOut) {
      const body = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        resourceId: resource.resourceId,
      };
      await deleteInBackend(body, RESOURCE_URL);
    } else {
      // remove resource inside section
      const body = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        sectionId: sectionId,
        resourceId: resource.resourceId,
      };
      await deleteInBackend(body, RESOURCE_URL);
    }
  };

  // edit title of Section and remove section
  const handleEditTitle = async (newTitle: string, sectionId: string, feature: Feature) => {
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

      return copy;
    });

    // send to backend
    if (feature === Feature.EditSectionTitle) {
      const body = {
        sectionId: sectionId,
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: newTitle,
      };
      await sendToBackend(body, SECTION_URL);
    } else {
      // delete section
      const body = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        sectionId: sectionId,
      };
      await deleteInBackend(body, SECTION_URL);
    }
  };

  // Send update and add new resource/section to backend
  const sendToBackend = async (body: any, url: string) => {
    const [data, err] = await apiPut<any, { resourceId: string }>(
      url,
      await authUser.getIdToken(),
      body,
    );

    if (err !== null) {
      console.error(err);
    }

    if (data === null) throw new Error("This shouldn't have happened");
    return data.resourceId;
  };

  // delete Resource/section in backend
  const deleteInBackend = async (body: any, url: string) => {
    const [data, err] = await apiDelete<any, { sectionId: string }>(
      url,
      await authUser.getIdToken(),
      body,
    );

    if (err !== null) {
      console.error(err);
    }
  };

  // Add Resource outside or in section
  const handleAddResource = async (
    feature: Feature,
    newResource?: ResourcesType,
    newSection?: SectionsType,
    sectionId?: string,
  ) => {
    if (feature === Feature.AddResourceOut) {
      const resourseOut = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: newResource?.title,
        description: newResource?.description,
      };
      if (newResource) {
        newResource.resourceId = await sendToBackend(resourseOut, RESOURCE_URL);
      }
    } else if (feature === Feature.AddSectionResource) {
      const sectionResourse = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: newResource?.title,
        description: newResource?.description,
        sectionId: sectionId,
      };
      if (newResource) {
        newResource.resourceId = await sendToBackend(sectionResourse, RESOURCE_URL);
      }
    } else {
      // add section
      const sectionBody = {
        courseId: courseId,
        pageId: pageInfo.pageId,
        title: newSection?.title,
      };

      if (newSection) {
        newSection.sectionId = await sendToBackend(sectionBody, SECTION_URL);
      }
    }

    setNewMaterials((prev) => {
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
