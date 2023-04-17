import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import moment from "moment";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { getOnlineClassDetails, sendOnlineClassMessage } from "util/api/onlineClassApi";
import { MessageInterface } from "models/message.model";
import { OnlineClassFull } from "models/onlineClass.model";

type ChatSectionProps = {
  dynamicOnlineClass: OnlineClassFull;
  /**
   * Students will not always have access to the chat
   */
  student?: boolean;
  courseId: string;
};

type ChatMessageProps = {
  message: MessageInterface;
};

const ChatMessage = ({ message }: ChatMessageProps): JSX.Element => {
  return (
    <div className="w-full flex flex-row py-3">
      <div className="mr-3">
        <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
          <div className="font-bold text-2xl">{`${message.senderName
            .charAt(0)
            .toUpperCase()}${message.senderName.split(" ")[1].charAt(0).toUpperCase()}`}</div>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="mb-1">
          <span className="font-semibold text-black">{message.senderName}</span>
          <span className="ml-2 text-[#959595]">
            {moment.utc(message.timestamp).format("DD/MM h:m A")}
          </span>
        </div>
        <div>
          <span className="break-all">{message.message}</span>
        </div>
      </div>
    </div>
  );
};

const ChatSection = ({ dynamicOnlineClass, student, courseId }: ChatSectionProps): JSX.Element => {
  const authUser = useAuthUser();
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<MessageInterface[]>([]);
  const [chatEnabled, setChatEnabled] = React.useState(dynamicOnlineClass.chatEnabled);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [messageSent, setMessageSent] = React.useState(false);
  const [classRunning, setClassRunning] = React.useState(dynamicOnlineClass.running);

  React.useEffect(() => {
    // On load, set to bottom scroll
    const scrollableElement = scrollableRef.current;
    if (scrollableElement !== null) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    // ChatGPT solution to force scrolling to the bottom
    // This solution will work as useEffects are only triggered after the UI re-renders
    // As such, it will be able to scroll down to the new message we just rendered
    const scrollableElement = scrollableRef.current;
    if (scrollableElement !== null) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  }, [messageSent]);

  const getData = async () => {
    const [res, err] = await getOnlineClassDetails(
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
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setMessages(res.chatMessages);
    setChatEnabled(res.chatEnabled);
    setClassRunning(res.running);
  };

  React.useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, dynamicOnlineClass._id]);

  // Polling
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Polling!!!");
      getData();
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, dynamicOnlineClass._id]);

  /**
   * @pre newMessage.length > 0
   */
  const handleSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const [res, err] = await sendOnlineClassMessage(
      await authUser.getIdToken(),
      dynamicOnlineClass._id,
      newMessage,
      courseId,
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
    setMessages([...res.chatMessages]);
    setLoading(false);
    setNewMessage("");

    // Set scroll bottom when sending a new message
    // Do this by changing this state
    setMessageSent(!messageSent);
  };

  return (
    <div className="w-full flex h-[90%] flex-col">
      {/* Top */}
      <h1 className="text-4xl font-bold w-full text-center">Chat messages</h1>
      <div className="h-[70%] max-h-[800px] overflow-y-auto" ref={scrollableRef}>
        {messages.map((x) => {
          return <ChatMessage key={x._id} message={x} />;
        })}
      </div>
      {/* bottom */}
      <form className="flex flex-row mt-3" onSubmit={handleSend}>
        <TextField
          id="Message"
          label="Message"
          variant="outlined"
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full"
          value={newMessage}
        />
        <LoadingButton
          variant="contained"
          loading={loading}
          disabled={
            newMessage.length === 0 || (student === true ? !chatEnabled || !classRunning : false)
          }
          type="submit"
        >
          Send
        </LoadingButton>
      </form>
    </div>
  );
};

export default ChatSection;
