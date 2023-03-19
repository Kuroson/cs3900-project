import React from "react";
import { toast } from "react-toastify";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { UploadFilePayloadResponse, addNewResource, uploadResourceFile } from "util/api/pageApi";

type AddNewResourceSectionProps = {
  courseId: string;
  pageId: string;
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  resources: ResourceInterface[];
  sectionId: string | null;
};

const AddNewResourceSection = ({
  courseId,
  pageId,
  setResources,
  resources,
  sectionId,
}: AddNewResourceSectionProps): JSX.Element => {
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
              id="Resource Title"
              label="Resource Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-[300px] max-w-[500px]"
            />
          </div>
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
          <div className="pt-4 w-full flex justify-between">
            <div className="flex items-center">
              <Button
                variant="outlined"
                component="label"
                sx={{ width: "200px" }}
                startIcon={<DriveFolderUploadIcon />}
              >
                Upload Material
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
            <div className="flex gap-2">
              <Button variant="outlined" color="error" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleNewResource} disabled={title === ""}>
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
        Add New Resource
      </Button>
    </div>
  );
};

export default AddNewResourceSection;
