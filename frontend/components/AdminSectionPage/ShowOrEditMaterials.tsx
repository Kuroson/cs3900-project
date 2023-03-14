import React, { useState } from "react";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import { Button } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import ShowResource from "components/common/ShowOrEditResource";
import TitleWithIcon from "components/common/TitleWithIcon";

// export type pageInfo = {
//     title: string;
//     courseId: string;
//     pageId: string;
//     resources: resources[];
//     sections: sections[];
//   };

// export type resources = {
//   resourceId: string;
//   title: string;
//   description?: string;
//   type: string;
//   linkToResource: string;
// };
// export type sections = {
//   sectionId: string;
//   title: string;
//   resources: resources[];
// };

const defaultM: PageType = {
  title: "resource1",
  courseId: "1",
  pageId: "2",
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
      linkToResource: "",
    },
    {
      resourceId: "6",
      title: "file3",
      description: "hello 6 resource",
      type: "pdf",
      linkToResource: "",
    },
  ],
  sections: [],
};

const EditMaterials: React.FC<{
  pageInfo: PageType;
  handleSave: (newPages: PageType) => void | (() => void);
  handleCloseEdit: () => void;
  editing: boolean;
}> = ({ pageInfo, handleSave, handleCloseEdit, editing }) => {
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
      console.log("🚀 ~ file: EditMaterials.tsx:67 ~ handleEditResourceOut ~ copy:", copy);
      return copy;
    });
  };

  const saveEditedResources = () => {
    handleSave(newMaterials);
  };

  return (
    <>
      {/* Resources */}
      <TitleWithIcon text="Resources">
        <FilePresentIcon color="primary" />
      </TitleWithIcon>
      <div className="flex flex-col">
        {newMaterials.resources.map((resource, index) => (
          <ShowResource
            resource={resource}
            key={index}
            editing={editing}
            handleEditResource={handleEditResourceOut}
          />
        ))}
      </div>
      {/* Sections */}
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

export default EditMaterials;
