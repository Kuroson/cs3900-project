import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { ResourcesType, SectionsType } from "pages/admin/[courseId]/[pageId]";
import { Feature } from "./ShowOrEditPage";

const AddSection: React.FC<{
  handleAddResource: (
    feature: Feature,
    newResource?: ResourcesType,
    newSection?: SectionsType,
    sectionId?: string,
  ) => void;
}> = ({ handleAddResource }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const clearForm = () => {
    setShowForm(false);
    setTitle("");
  };

  const addNewSection = () => {
    const newSection: SectionsType = {
      title: title,
      resources: [],
    };
    // TODO: send above to api and api return id then add it to newMaterials
    const fakeId = "50";
    newSection.sectionId = fakeId;
    handleAddResource(Feature.AddSection, undefined, newSection);
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
          <div className="flex gap-2">
            <Button variant="outlined" color="error" onClick={clearForm}>
              Cancel
            </Button>
            <Button variant="contained" onClick={addNewSection}>
              Add
            </Button>
          </div>
        </div>
      )}
      <Button
        sx={{ width: "fit-content", marginY: "20px" }}
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowForm(true)}
      >
        Section
      </Button>
    </div>
  );
};

export default AddSection;
