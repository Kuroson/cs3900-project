import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { OnlineClassFull } from "models/onlineClass.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { endOnlineClass, startOnlineClass } from "util/api/onlineClassApi";

type StartAndEndClassButtonsProps = {
  dynamicOnlineClass: OnlineClassFull;
  setDynamicOnlineClass: React.Dispatch<React.SetStateAction<OnlineClassFull>>;
};

const StartAndEndClassButtons = ({
  dynamicOnlineClass,
  setDynamicOnlineClass,
}: StartAndEndClassButtonsProps): JSX.Element => {
  const authUser = useAuthUser();
  const [runningLoading, setRunningLoading] = React.useState(false);

  const handleStartClass = async () => {
    setRunningLoading(true);
    const [res, err] = await startOnlineClass(
      await authUser.getIdToken(),
      dynamicOnlineClass._id,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setRunningLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setRunningLoading(false);
    setDynamicOnlineClass({ ...dynamicOnlineClass, running: true });
    toast.success(res.message);
  };

  const handleEndClass = async () => {
    setRunningLoading(true);
    const [res, err] = await endOnlineClass(
      await authUser.getIdToken(),
      dynamicOnlineClass._id,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setRunningLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setRunningLoading(false);
    setDynamicOnlineClass({ ...dynamicOnlineClass, running: false });
    toast.success(res.message);
  };

  return (
    <div className="w-full pt-6 flex flex-row justify-center items-center">
      <LoadingButton
        variant="contained"
        className="mx-5"
        disabled={dynamicOnlineClass.running}
        onClick={handleStartClass}
        loading={runningLoading && !dynamicOnlineClass.running}
      >
        Start Class
      </LoadingButton>
      <LoadingButton
        variant="contained"
        className="mx-5"
        disabled={!dynamicOnlineClass.running}
        onClick={handleEndClass}
        loading={runningLoading && dynamicOnlineClass.running}
      >
        End Class
      </LoadingButton>
    </div>
  );
};

export default StartAndEndClassButtons;
