import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { MessageInterface } from "models/message.model";
import { OnlineClassFull } from "models/onlineClass.model";
import moment from "moment";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { getOnlineClassDetails, sendOnlineClassMessage } from "util/api/onlineClassApi";

type ChatSectionProps = {
  dynamicOnlineClass: OnlineClassFull;
};

const ChatSection = ({ dynamicOnlineClass }: ChatSectionProps): JSX.Element => {
  const authUser = useAuthUser();
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<MessageInterface[]>([]);
  const scrollableRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // ChatGPT solution to force scrolling to the bottom
    const scrollableElement = scrollableRef.current;
    if (scrollableElement !== null) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  }, [messages]);

  React.useEffect(() => {
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
    };
    getData();
  }, [authUser, dynamicOnlineClass._id]);

  // Polling
  React.useEffect(() => {
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
    };
    const intervalId = setInterval(() => {
      console.log("Polling!!!");
      getData();
    }, 2000);

    return () => clearInterval(intervalId);
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
  };

  return (
    <div className="w-full flex h-[90%] flex-col">
      {/* Top */}
      <h1 className="text-4xl font-bold w-full text-center">Chat messages</h1>
      <div className="h-[70%] max-h-[800px] overflow-y-auto" ref={scrollableRef}>
        {messages.map((x) => {
          return (
            <div key={x._id} className="w-full flex flex-row">
              <span>{`${moment.unix(x.timestamp).format("DD/MM/YY-hh:mm:ss A")} ${x.senderName}: ${
                x.message
              }`}</span>
            </div>
          );
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
          disabled={newMessage.length === 0}
          type="submit"
        >
          Send
        </LoadingButton>
      </form>
    </div>
  );
};

export default ChatSection;
