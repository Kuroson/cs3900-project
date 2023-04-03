import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { OnlineClassFull } from "models/onlineClass.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { disableChat, enableChat, endOnlineClass, startOnlineClass } from "util/api/onlineClassApi";

type EnableAndDisableChatButtonsProps = {
  dynamicOnlineClass: OnlineClassFull;
  setDynamicOnlineClass: React.Dispatch<React.SetStateAction<OnlineClassFull>>;
};

const EnableAndDisableChatButtons = ({
  dynamicOnlineClass,
  setDynamicOnlineClass,
}: EnableAndDisableChatButtonsProps): JSX.Element => {
  const authUser = useAuthUser();
  const [runningLoading, setRunningLoading] = React.useState(false);

  const handleEnableChat = async () => {
    setRunningLoading(true);
    const [res, err] = await enableChat(
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
    setDynamicOnlineClass({ ...dynamicOnlineClass, chatEnabled: true });
    toast.success(res.message);
  };

  const handleDisableChat = async () => {
    setRunningLoading(true);
    const [res, err] = await disableChat(
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
    setDynamicOnlineClass({ ...dynamicOnlineClass, chatEnabled: false });
    toast.success(res.message);
  };

  return (
    <div className="w-full pt-6 flex flex-row justify-center items-center">
      <LoadingButton
        variant="contained"
        className="mx-5"
        disabled={dynamicOnlineClass.chatEnabled}
        onClick={handleEnableChat}
        loading={runningLoading && dynamicOnlineClass.chatEnabled}
      >
        Enable Chat
      </LoadingButton>
      <LoadingButton
        variant="contained"
        className="mx-5"
        disabled={!dynamicOnlineClass.chatEnabled}
        onClick={handleDisableChat}
        loading={runningLoading && !dynamicOnlineClass.chatEnabled}
      >
        Disable Chat
      </LoadingButton>
    </div>
  );
};

export default EnableAndDisableChatButtons;
