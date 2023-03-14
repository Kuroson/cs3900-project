import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import { Button, IconButton, TextField } from "@mui/material";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";

// export type resources = {
//   resourceId: string;
//   title: string;
//   description?: string;
//   type: string;
//   linkToResource: string;
// };

const ShowOrEditResource: React.FC<{
  resource: ResourcesType;
  editing: boolean;
  handleEditResource: (newResource: ResourcesType) => void | (() => void);
}> = ({ resource, editing, handleEditResource }) => {
  const [editResource, setEditResource] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);

  const handleEditClick = () => {
    if (editResource) {
      // setNewMaterials(prev =>)
      const newResource: ResourcesType = {
        resourceId: resource.resourceId,
        title: title,
        description: description,
        type: resource.type, // todo
        linkToResource: resource.linkToResource, //todo
      };
      handleEditResource(newResource);
    }

    setEditResource((prev) => !prev);
  };

  return (
    <div>
      {editResource ? (
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
          {resource.type ? (
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
        <>
          <p className="">{resource.description ?? ""}</p>
          {/* TODO: not sure how to show resource, need to be changed*/}
          <div className="rounded-lg shadow-md px-5 py-3 w-fit">
            <p className="m-0">{resource.title}: </p>
            {/* read file linktoResource */}
          </div>
        </>
      )}
      {editing && (
        <>
          <IconButton color="primary" aria-label="edit" component="label" onClick={handleEditClick}>
            {editResource ? <DoneIcon /> : <EditIcon />}
          </IconButton>
          <IconButton color="error" aria-label="delete" component="label">
            <DeleteIcon />
          </IconButton>
        </>
      )}
    </div>
  );
};

export default ShowOrEditResource;
