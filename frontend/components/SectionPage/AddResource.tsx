import React, { useState } from "react";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { ResourcesType, SectionsType } from "pages/admin/[courseId]/[pageId]";
import { PROCESS_BACKEND_URL, apiGet, apiPost, apiUploadFile } from "util/api";
import ShowFile from "./ShowFile";
import { Feature } from "./ShowOrEditPage";

const AddResource: React.FC<{
  handleAddResource: (
    feature: Feature,
    newResource?: ResourcesType,
    newSection?: SectionsType,
    sectionId?: string,
  ) => void;
  sectionId?: string;
}> = ({ handleAddResource, sectionId }) => {
  const authUser = useAuthUser();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const clearForm = () => {
    setShowForm(false);
    setTitle("");
    setDescription("");
    setFile(null);
  };

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

  const addNewResource = async () => {
    const newResource: ResourcesType = {
      title: title,
      description: description,
    };
    // Upload file API
    console.log("New Resource => if has file then call api here");
    if (sectionId !== null && sectionId !== undefined) {
      // add outside resource
      await handleAddResource(Feature.AddSectionResource, newResource, undefined, sectionId);
    } else {
      // add outside resource
      await handleAddResource(Feature.AddResourceOut, newResource);
    }

    // Upload file if added
    if (file !== null && newResource.resourceId) {
      await apiUploadFile(`${PROCESS_BACKEND_URL}/file/upload`, await authUser.getIdToken(), file, {
        resourceId: newResource.resourceId,
      });

      // Refresh the page to show the resource
      router.reload();
    }

    clearForm();
  };

  const handleAddFile = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      {showForm && (
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
          <div className="flex justify-between max-w-[1000px]">
            <span>
              <Button
                variant="outlined"
                component="label"
                sx={{ width: "200px" }}
                startIcon={<DriveFolderUploadIcon />}
              >
                Upload Material
                <input hidden type="file" onChange={handleAddFile} />
              </Button>
              {file !== null && (
                <p>
                  <i>{file.name}</i>
                </p>
              )}
            </span>
            <div className="flex gap-2">
              <Button variant="outlined" color="error" onClick={clearForm}>
                Cancel
              </Button>
              <Button variant="contained" onClick={addNewResource} disabled={title === ""}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
      <Button
        sx={{ width: "fit-content", marginY: "20px" }}
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowForm(true)}
      >
        Resource
      </Button>
    </div>
  );
};

export default AddResource;
