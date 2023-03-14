import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import { Button, IconButton, TextField } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import { Feature } from "components/AdminSectionPage/ShowOrEditPage";

const ShowOrEditResource: React.FC<{
  resource: ResourcesType;
  handleEditResource: (
    resource: ResourcesType,
    feature: Feature,
    sectionId?: string,
  ) => void | (() => void);
  sectionId?: string;
}> = ({ resource, handleEditResource, sectionId }) => {
  const [editResource, setEditResource] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);

  const handleEditClick = () => {
    // click tick
    if (editResource) {
      const newResource: ResourcesType = {
        resourceId: resource.resourceId,
        title: title,
        description: description,
        fileType: resource.fileType, //todo: new file
        linkToResource: resource.linkToResource, //todo: new
      };
      if (sectionId === null || sectionId === undefined) {
        // finish edit outside resource
        handleEditResource(newResource, Feature.EditResourceOut);
      } else {
        // edit resource inside section
        handleEditResource(newResource, Feature.EditSectionResource, sectionId);
      }
      // TODO: call upload file api here if file changes
      console.log("if file changed, call api here");
    }

    setEditResource((prev) => !prev);
  };

  const handleRemove = () => {
    if (sectionId === null || sectionId === undefined) {
      console.log("first");
      // remove outside resource
      handleEditResource(resource, Feature.RemoveResourceOut);
    } else {
      // remove section resource
      handleEditResource(resource, Feature.RemoveSectionResource, sectionId);
    }
  };

  return (
    <div>
      {editResource ? (
        // Edit mode
        <div className="my-4 flex flex-col gap-2">
          <TextField
            id="Resource Title"
            label="Resource Title"
            variant="outlined"
            sx={{ maxWidth: "500px" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            id="Resource Description"
            label="Resource Description"
            variant="outlined"
            multiline
            rows={5}
            sx={{ maxWidth: "1000px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {resource.fileType != null ? (
            <div>TODO: show resource</div>
          ) : (
            <Button
              variant="contained"
              component="label"
              sx={{ width: "200px" }}
              startIcon={<DriveFolderUploadIcon />}
            >
              Upload Material
              <input hidden accept="image/*" multiple type="file" />
            </Button>
          )}
        </div>
      ) : (
        // read mode
        <div className="my-3">
          <h4 className="m-0">{resource.title}</h4>
          <p className="">{resource.description ?? ""}</p>
          {/* TODO: not sure how to show resource, need to be changed*/}
          {resource.linkToResource != null && (
            <div className="rounded-lg shadow-md px-5 py-3 w-fit">
              {/* read file linktoResource */}
              {resource.linkToResource}
            </div>
          )}
        </div>
      )}
      <>
        <IconButton color="primary" aria-label="edit" component="label" onClick={handleEditClick}>
          {editResource ? <DoneIcon /> : <EditIcon />}
        </IconButton>
        <IconButton color="error" aria-label="delete" component="label" onClick={handleRemove}>
          <DeleteIcon />
        </IconButton>
      </>
    </div>
  );
};

export default ShowOrEditResource;
