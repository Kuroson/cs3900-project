import React, { useEffect } from "react";
import { Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { useUser } from "util/UserContext";
import { CLIENT_BACKEND_URL } from "util/api/api";
import { StudentKudosInfo, getStudentsKudos } from "util/api/courseApi";

type LeaderboardProps = {
  courseId: string;
};

const Leaderboard = ({ courseId }: LeaderboardProps): JSX.Element => {
  const authUser = useAuthUser();
  const user = useUser();
  const [studentsKudosInfo, setStudentsKudosInfo] = React.useState<StudentKudosInfo[]>();

  useEffect(() => {
    const getStudentsKudosInfo = async () => {
      const [res, err] = await getStudentsKudos(
        await authUser.getIdToken(),
        { courseId: courseId },
        "client",
      );
      if (err !== null) {
        console.error(err);
        return; // toast
      }
      if (res === null) throw new Error("Response and error are null");
      setStudentsKudosInfo(res.students);
    };
    getStudentsKudosInfo();
  }, []);
  return (
    <div className="p-5 min-w-min max-w-sm mx-3 my-2">
      <div
        className="w-full py-5 px-10 rounded-lg border-solid border-5 border-[#26a69a;]"
        data-cy={`section-${Leaderboard}`}
      >
        <div className="w-full items-end">
          <div className="flex-row flex w-full justify-between">
            <div>
              <span className="w-full text-xl font-medium flex flex-col">Leaderboard</span>
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <List>
            {studentsKudosInfo?.map((person) => {
              console.error(person);
              return (
                <ListItem
                  key={person._id}
                  className={
                    person.student._id === user.userDetails?._id
                      ? "border-solid border-2 border-rose-600 rounded-full"
                      : ""
                  }
                >
                  <ListItemIcon>
                    <div
                      className={"w-[50px] h-[50px] rounded-full flex justify-center items-center"}
                    >
                      <img
                        src={`${CLIENT_BACKEND_URL}/public/avatars/${
                          person.student.avatar?.length !== 0 ? person.student.avatar : "missy"
                        }.svg`}
                        className="h-[50px] w-[50px] rounded-full"
                        alt=""
                      />
                    </div>
                  </ListItemIcon>
                  <ListItemText primary={person.kudosEarned} className="px-10" />
                </ListItem>
              );
            })}
          </List>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
