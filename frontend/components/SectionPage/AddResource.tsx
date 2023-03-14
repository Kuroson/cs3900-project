import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { ResourcesType, SectionsType } from "pages/admin/[courseId]/[pageId]";
import { PROCESS_BACKEND_URL, apiPost } from "util/api";
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
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");

  const clearForm = () => {
    setShowForm(false);
    setTitle("");
    setDescription("");
    setFile("");
  };

  const addNewResource = () => {
    const newResource: ResourcesType = {
      title: title,
      description: description,
      fileType: "", //todo: new file
      linkToResource: file, //todo: new
    };
    // TODO: Upload file API
    console.log("New Resource => if has file then call api here");
    if (sectionId !== null && sectionId !== undefined) {
      // add outside resource
      handleAddResource(Feature.AddSectionResource, newResource, undefined, sectionId);
    } else {
      // add outside resource
      console.log("first");
      handleAddResource(Feature.AddResourceOut, newResource);
    }

    clearForm();
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
            {file != "" ? (
              // TODO: show resource
              <ShowFile />
            ) : (
              <Button
                variant="outlined"
                component="label"
                sx={{ width: "200px" }}
                startIcon={<DriveFolderUploadIcon />}
              >
                Upload Material
                <input hidden accept="image/*" multiple type="file" />
              </Button>
            )}
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
