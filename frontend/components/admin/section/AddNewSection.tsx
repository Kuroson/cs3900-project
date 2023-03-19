import React from "react";
import { toast } from "react-toastify";
import { Button, IconButton, TextField } from "@mui/material";
import { SectionFull } from "models/section.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { AddSectionPayloadRequest, createSection } from "util/api/pageApi";

type AddNewSectionProps = {
  courseId: string;
  pageId: string;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
};

const AddNewSection = ({
  courseId,
  pageId,
  sections,
  setSections,
}: AddNewSectionProps): JSX.Element => {
  const authUser = useAuthUser();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    setOpen(false);
    setTitle("");
  }, [courseId, pageId]);

  const handleCloseForm = async () => {
    setOpen(false);
    setTitle("");
  };

  const handleNewSection = async () => {
    const newSection: AddSectionPayloadRequest = {
      title: title,
      courseId: courseId,
      pageId: pageId,
      sectionId: null,
    };

    const [res, err] = await createSection(await authUser.getIdToken(), newSection, "client");

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not add a new section");
      }
      return;
    }
    if (res === null) throw new Error("Should not happen");
    const newSectionToAdd: SectionFull = {
      _id: res.sectionId,
      title: title,
      resources: [],
    };

    setSections([...sections, newSectionToAdd]);
    toast.success("Added a new section");
    setTitle("");
    // setSections((prev) => [...prev, newSection]);
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="pb-4">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Section
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-4 flex flex-col">
      <div className="pb-4">
        <TextField
          id="Resource Title"
          label="Resource Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-[300px] max-w-[500px]"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outlined" color="error" onClick={handleCloseForm}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleNewSection} disabled={title === ""}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddNewSection;
