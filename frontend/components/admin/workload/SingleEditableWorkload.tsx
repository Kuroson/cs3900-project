import React from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import {
  RemoveResourcePayloadRequest,
  UpdatePagePayloadRequest,
  removeResource,
  updatePageResource,
  uploadResourceFile,
} from "util/api/pageApi";
import EditPanelButtons from "../EditPanelButtons";

type SingleEditableResourceProps = {
  resource: ResourceInterface;
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  courseId: string;
  pageId: string;
  resources: ResourceInterface[];
  sectionId: string | null;
};

/**
 * Component for a single resource.
 * Has an edit option
 */
const SingleEditableResource = ({
  resource,
  setResources,
  courseId,
  pageId,
  resources,
  sectionId,
}: SingleEditableResourceProps): JSX.Element => {
  const authUser = useAuthUser();

  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(resource.title);
  const [description, setDescription] = React.useState(resource.description);
  const [storedName, setStoredName] = React.useState(resource.stored_name);
  const [fileType, setFileType] = React.useState(resource.file_type);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [file, setFile] = React.useState<any>(null);

  const FROG_IMAGE_URL =
    "https://i.natgeofe.com/k/8fa25ea4-6409-47fb-b3cc-4af8e0dc9616/red-eyed-tree-frog-on-leaves-3-2_3x2.jpg";

  const handleRemoveClick = async () => {
    // Remove
    const payload: RemoveResourcePayloadRequest = {
      courseId: courseId,
      pageId: pageId,
      resourceId: resource._id,
      sectionId: null,
    };

    const [res, err] = await removeResource(await authUser.getIdToken(), payload, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not remove resource. Please try again later.");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Resource removed");

    // Update UI
    setResources([...resources.filter((r) => r._id !== resource._id)]);
  };

  const handleEditClick = async () => {
    if (editMode) {
      // Was already in edit mode, need to save changes now
      // Save the text
      const newResource: UpdatePagePayloadRequest = {
        courseId: courseId,
        pageId: pageId,
        resourceId: resource._id,
        title: title,
        description: description ?? "",
        sectionId: sectionId,
      };

      const [res, err] = await updatePageResource(
        await authUser.getIdToken(),
        newResource,
        "client",
      );

      if (err !== null) {
        // Error exists
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not save changes. Please try again later.");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't happen");
      toast.success("Text changes saved");

      if (file !== null) {
        // Save files now
        toast.warning("File upload detected");
        const [fileRes, fileErr] = await uploadResourceFile(
          await authUser.getIdToken(),
          file,
          { resourceId: resource._id },
          "client",
        );

        if (fileErr !== null) {
          console.error(fileErr);
          if (fileErr instanceof HttpException) {
            toast.error(fileErr.message);
          } else {
            toast.error("Failed to upload file");
          }
          return;
        }

        if (fileRes === null) throw new Error("Shouldn't happen");
        setStoredName(fileRes.download_link);
        setFileType(fileRes.file_type);
        toast.success("File uploaded");
        setFile(null);
      }
    }
    setEditMode(!editMode);
  };

  // Show edit interface
  if (editMode) {
    return (
      <div className="w-full pt-5" data-cy="current-edit">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="ResourceTitle"
              label="Resource Title"
              variant="outlined"
              sx={{ maxWidth: "500px" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <TextField
            id="ResourceDescription"
            label="Resource Description"
            variant="outlined"
            multiline
            rows={5}
            sx={{ maxWidth: "1000px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {storedName !== "" && storedName !== undefined ? (
            <Link href={storedName} target="_blank" className="py-4">
              <Button variant="contained">Download existing resource</Button>
            </Link>
          ) : (
            <div className="w-full flex items-center">
              <Button
                variant="contained"
                component="label"
                className="w-[250px] my-4"
                startIcon={<DriveFolderUploadIcon />}
              >
                Upload New Material
                <input
                  hidden
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
              {file !== null && (
                <p className="pl-5">
                  <i>{file.name}</i>
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <EditPanelButtons
            editMode={editMode}
            handleEditClick={handleEditClick}
            handleRemoveClick={handleRemoveClick}
          />
        </div>
      </div>
    );
  }

  // Show normal interface
  return (
    <div className="w-full pt-5" data-cy={`section-${title}`}>
      <span className="w-full text-xl font-medium flex flex-col">{title}</span>
      {/* Description */}
      {description !== undefined && <p>{description}</p>}
      {/* Resource */}
      {storedName !== undefined && (
        <div className="my-5">
          {fileType?.includes("image") ?? false ? (
            <div>
              <img src={storedName ?? FROG_IMAGE_URL} alt={description} />
            </div>
          ) : (
            <Link href={storedName} target="_blank">
              <Button variant="contained">Download File</Button>
            </Link>
          )}
        </div>
      )}
      <div data-cy="edit-button-section">
        <EditPanelButtons
          editMode={editMode}
          handleEditClick={handleEditClick}
          handleRemoveClick={handleRemoveClick}
        />
      </div>
    </div>
  );
};

export default SingleEditableResource;
