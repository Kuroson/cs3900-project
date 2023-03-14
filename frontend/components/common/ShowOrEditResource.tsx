import React, { useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import { Button, IconButton, TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import { Feature } from "components/SectionPage/ShowOrEditPage";
import { PROCESS_BACKEND_URL, apiPost, apiUploadFile } from "util/api";

const ShowOrEditResource: React.FC<{
  resource: ResourcesType;
  handleEditResource: (
    resource: ResourcesType,
    feature: Feature,
    sectionId?: string,
  ) => Promise<void> | (() => void);
  sectionId?: string;
}> = ({ resource, handleEditResource, sectionId }) => {
  const authUser = useAuthUser();
  const [editResource, setEditResource] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [file, setFile] = useState<File | null>(null);

  // const uploadResource = async () => {
  //   const [res, err] = await apiPost<CreatePagePayload, NewPagePayload>(
  //     `${PROCESS_BACKEND_URL}/page/${courseId}`,
  //     await authUser.getIdToken(),
  //     {
  //       courseId,
  //       title: name,
  //     },
  //   );

  //   if (err !== null) {
  //     console.error(err);
  //     if (err instanceof HttpException) {
  //       toast.error(err.message);
  //     } else {
  //       toast.error(err);
  //     }
  //   }

  //   if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
  //   return res;
  // };

  const handleEditClick = async () => {
    // click tick
    if (editResource) {
      const newResource: ResourcesType = {
        resourceId: resource.resourceId,
        title: title,
        description: description,
        fileType: resource.fileType, //todo: new file, currently is old file
        linkToResource: resource.linkToResource, //todo: new, currently is old
      };
      let resourceId = "";
      if (sectionId === null || sectionId === undefined) {
        // finish edit outside resource
        handleEditResource(newResource, Feature.EditResourceOut);
      } else {
        // edit resource inside section
        handleEditResource(newResource, Feature.EditSectionResource, sectionId);
      }
      // TODO: call upload file api here if file changes
      console.log("if file changed, call api here");

      // Upload file if uploaded/changed
      if (file !== null) {
        apiUploadFile(`${PROCESS_BACKEND_URL}/file/upload`, await authUser.getIdToken(), file, {
          resourceId,
        });
      }
    }

    setEditResource((prev) => !prev);
  };

  const handleRemove = () => {
    if (sectionId === null || sectionId === undefined) {
      // remove outside resource
      handleEditResource(resource, Feature.RemoveResourceOut);
    } else {
      // remove section resource
      handleEditResource(resource, Feature.RemoveSectionResource, sectionId);
    }
  };

  const handleAddFile = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
          {resource.linkToResource !== "" && (
            // Show resource
            <div>
              {resource.fileType?.includes("image") ? (
                <img src={resource.linkToResource} />
              ) : (
                <Button href={resource.linkToResource}>Download existing resource</Button>
              )}
            </div>
          )}

          <Button
            variant="contained"
            component="label"
            sx={{ width: "250px" }}
            startIcon={<DriveFolderUploadIcon />}
          >
            Upload New Material
            {/* <input hidden accept="image/*" multiple type="file" /> */}
            <input hidden type="file" onChange={handleAddFile} />
          </Button>
        </div>
      ) : (
        // read mode
        <div className="my-3">
          <h4 className="m-0">{resource.title}</h4>
          <p className="">{resource.description ?? ""}</p>
          {resource.linkToResource != "" && (
            <div className="rounded-lg shadow-md px-5 py-3 w-fit">
              {/* read file linktoResource */}
              {resource.fileType?.includes("image") ? (
                <img src={resource.linkToResource} />
              ) : (
                <Button href={resource.linkToResource}>Download resource</Button>
              )}
            </div>
          )}
        </div>
      )}
      <>
        <IconButton
          color="primary"
          aria-label="edit"
          component="label"
          onClick={handleEditClick}
          disabled={editResource && title === ""}
        >
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
