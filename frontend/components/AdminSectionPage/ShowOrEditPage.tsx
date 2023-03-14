import React, { useState } from "react";
import { Button } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import ShowOrEditSectionT from "./ShowOrEditSectionT";

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
          title: "file1.py",
          description: "",
          type: "",
          linkToResource: "",
        },
        {
          resourceId: "5",
          title: "file2.py",
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
  handleSave: (newPages: PageType) => void | (() => void);
  handleCloseEdit: () => void;
  editing: boolean;
}> = ({ pageInfo, handleSave, handleCloseEdit, editing }) => {
  // TODO: replace to pageInfo
  const [newMaterials, setNewMaterials] = useState<PageType>(defaultM);

  // edit resource outside of sections
  const handleEditResourceOut = (newResource: ResourcesType) => {
    setNewMaterials((prev) => {
      const copy = { ...prev };
      const resources = copy.resources;
      const oldResourceIndex = resources.findIndex(
        (re) => re.resourceId === newResource.resourceId,
      );
      resources.splice(oldResourceIndex, 1, newResource);
      copy.resources = resources;
      return copy;
    });
  };

  const saveEditedResources = () => {
    handleSave(newMaterials);
  };

  return (
    <>
      {/* Resources outside sections: show/edit mode*/}
      <div className="flex flex-col mb-4">
        {newMaterials.resources.map((resource, index) => (
          <ShowOrEditResource
            resource={resource}
            key={index}
            editing={editing}
            handleEditResource={handleEditResourceOut}
          />
        ))}
      </div>
      {/* Sections */}
      {newMaterials.sections.map((section, index) => (
        <div key={`section_${index}`}>
          <ShowOrEditSectionT title={section.title} editing={editing} />
        </div>
      ))}
      {/* edit mode */}
      {editing && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              setNewMaterials(defaultM);
              handleCloseEdit();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEditedResources}>
            Save
          </Button>
        </div>
      )}
    </>
  );
};

export default ShowOrEditPage;
