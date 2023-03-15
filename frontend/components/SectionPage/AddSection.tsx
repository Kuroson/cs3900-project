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
    handleAddResource(Feature.AddSection, undefined, newSection);
    clearForm();
  };

  return (
    <div>
      {showForm && (
        <div className="my-4 flex flex-col gap-2">
          <TextField
            id="Section Title"
            label="Section Title"
            variant="outlined"
            sx={{ maxWidth: "500px" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outlined" color="error" onClick={clearForm}>
              Cancel
            </Button>
            <Button variant="contained" onClick={addNewSection} disabled={title === ""}>
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
