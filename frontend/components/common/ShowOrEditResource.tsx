import React, { useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import { Button, IconButton, TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { PageType, ResourcesType } from "pages/admin/[courseId]/[pageId]";
import { Feature } from "components/SectionPage/ShowOrEditPage";
import { PROCESS_BACKEND_URL, apiGet, apiPost, apiUploadFile } from "util/api";

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
  const [linkToResource, setLinkToResource] = useState(resource.linkToResource);
  const [fileType, setFileType] = useState(resource.fileType);
  const [file, setFile] = useState<File | null>(null);

  type FileDetailsPayload = {
    linkToFile: string;
    fileType: string;
  };

  const updateFileInfo = async (resourceId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, err] = await apiGet<any, FileDetailsPayload>(
      `${PROCESS_BACKEND_URL}/file/download/${resourceId}`,
      await authUser.getIdToken(),
      {},
    );

    if (err !== null) {
      console.error(err);
      // handle error
      return {
        linkToFile: null,
        fileType: null,
      };
    }

    if (data === null) throw new Error("This shouldn't have happened");
    return data;
  };

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

      // Upload file if uploaded/changed
      if (file !== null && resource.resourceId !== undefined) {
        await apiUploadFile(
          `${PROCESS_BACKEND_URL}/file/upload`,
          await authUser.getIdToken(),
          file,
          {
            resourceId: resource.resourceId,
          },
        );

        // Call backend to get new resource
        const newFileInfo = await updateFileInfo(resource.resourceId);
        if (newFileInfo.linkToFile !== null && newFileInfo.fileType !== null) {
          resource.linkToResource = newFileInfo.linkToFile;
          resource.fileType = newFileInfo.fileType;
          setLinkToResource(newFileInfo.linkToFile);
          setFileType(newFileInfo.fileType);
        }
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
          {linkToResource !== "" && (
            // Show resource
            <div>
              {fileType?.includes("image") ? (
                <img src={linkToResource} />
              ) : (
                <Button href={linkToResource}>Download existing resource</Button>
              )}
            </div>
          )}

          <div className="flex justify-start max-w-[1000px]">
            <Button
              variant="contained"
              component="label"
              sx={{ width: "250px" }}
              startIcon={<DriveFolderUploadIcon />}
            >
              Upload New Material
              <input hidden type="file" onChange={handleAddFile} />
            </Button>
            {file !== null && (
              <p className="pl-5">
                <i>{file.name}</i>
              </p>
            )}
          </div>
        </div>
      ) : (
        // read mode
        <div className="my-3">
          <h4 className="m-0">{title}</h4>
          <p className="">{description ?? ""}</p>
          {linkToResource != "" && (
            <div className="rounded-lg shadow-md px-5 py-3 w-fit">
              {/* read file linktoResource */}
              {fileType?.includes("image") ? (
                <img src={linkToResource} />
              ) : (
                <Button href={linkToResource}>Download resource</Button>
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
