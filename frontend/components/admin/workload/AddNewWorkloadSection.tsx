import React from "react";
import { toast } from "react-toastify";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { UploadFilePayloadResponse, addNewResource, uploadResourceFile } from "util/api/pageApi";

type AddNewWorkloadSectionProps = {
  courseId: string;
  pageId: string;
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  resources: ResourceInterface[];
  sectionId: string | null;
};

const AddNewWorkloadSection = ({
  courseId,
  pageId,
  setResources,
  resources,
  sectionId,
}: AddNewWorkloadSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [file, setFile] = React.useState<any>(null);

  const handleCloseForm = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setFile(null);
  };

  React.useEffect(() => {
    setOpen(false);
  }, [pageId, courseId]);

  const handleNewResource = async () => {
    // Create the new resource
    const newResource = {
      title: title,
      description: description,
      courseId: courseId,
      pageId: pageId,
      sectionId: sectionId,
    };

    const [res, err] = await addNewResource(await authUser.getIdToken(), newResource, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add new resource");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("New resource added");

    // Upload file
    let fileUploadData: UploadFilePayloadResponse | null = null;
    if (file !== null) {
      // Save files now
      toast.warning("File upload detected");
      const [fileRes, fileErr] = await uploadResourceFile(
        await authUser.getIdToken(),
        file,
        { resourceId: res.resourceId },
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
      // setStoredName(fileRes.download_link);
      // setFileType(fileRes.file_type);
      fileUploadData = fileRes;
      toast.success("File uploaded");
      setFile(null);
    }

    // Append resource now
    const resourceToAdd: ResourceInterface = {
      _id: res.resourceId,
      title: title,
      description: description,
      stored_name: fileUploadData?.download_link ?? undefined,
      file_type: fileUploadData?.file_type ?? undefined,
    };
    setResources([...resources, resourceToAdd]);

    handleCloseForm();
  };

  if (open) {
    return (
      <div className="w-full pt-4">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="ResourceTitle"
              label="Resource Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-[300px] max-w-[500px]"
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
          <div className="pt-4 w-full flex justify-between">
            <div className="flex gap-2">
              <Button variant="outlined" color="error" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                id="createResourceButton"
                variant="contained"
                onClick={handleNewResource}
                disabled={title === ""}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Workload To do List
      </Button>
    </div>
  );
};

export default AddNewWorkloadSection;
