import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { OnlineClassFull } from "models/onlineClass.model";
import moment from "moment";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { UpdateOnlineClassPayloadRequest, updateOnlineClass } from "util/api/onlineClassApi";
import { youtubeURLParser } from "util/util";

type EditOnlineClassSectionProps = {
  dynamicOnlineClass: OnlineClassFull;
  setDynamicOnlineClass: React.Dispatch<React.SetStateAction<OnlineClassFull>>;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditOnlineClassSection = ({
  dynamicOnlineClass,
  setDynamicOnlineClass,
  setEditMode,
}: EditOnlineClassSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState(dynamicOnlineClass.title);
  const [description, setDescription] = React.useState(dynamicOnlineClass.description);
  const [linkToClass, setLinkToClass] = React.useState(dynamicOnlineClass.linkToClass);
  const [startTime, setStartTime] = React.useState(dynamicOnlineClass.startTime);

  const handleOnSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (title === "") {
      toast.warning("Please enter a title");
      return;
    }
    if (startTime === null) {
      toast.warning("Please enter a start time");
      return;
    }
    if (linkToClass === "" || youtubeURLParser(linkToClass) === false) {
      toast.warning("Please enter a valid YouTube URL link");
      return;
    }
    setLoading(true);
    const newOnlineClassData: UpdateOnlineClassPayloadRequest = {
      title,
      description,
      linkToClass,
      startTime,
      classId: dynamicOnlineClass._id,
    };

    const [res, err] = await updateOnlineClass(
      await authUser.getIdToken(),
      newOnlineClassData,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setDynamicOnlineClass({ ...dynamicOnlineClass, ...newOnlineClassData });
    setLoading(false);
    toast.success("Successfully updated online class");
    setEditMode(false);
  };

  return (
    <form className="w-full" onSubmit={handleOnSubmit}>
      <div>
        <TextField
          id="Title"
          label="Course Title"
          variant="outlined"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
          value={title}
        />
      </div>
      <div className="pt-5">
        <DateTimePicker
          label="Date Time"
          className="w-full"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setStartTime(e.unix())}
          value={moment.unix(startTime)}
        />
      </div>
      <div className="pt-5">
        <TextField
          id="Link"
          label="URL Link"
          variant="outlined"
          onChange={(e) => setLinkToClass(e.target.value)}
          className="w-full"
          value={linkToClass}
        />
      </div>
      <div className="pt-5">
        <TextField
          id="Description"
          label="Description"
          variant="outlined"
          multiline
          rows={9}
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full"
        />
      </div>
      <div className="pt-5 w-full">
        <LoadingButton variant="contained" className="w-full" loading={loading} type="submit">
          Submit Changes
        </LoadingButton>
      </div>
    </form>
  );
};

export default EditOnlineClassSection;
