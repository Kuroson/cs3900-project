import React, { useEffect } from "react";
import { Checkbox, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { CLIENT_BACKEND_URL } from "util/api/api";
import {
  GetStudentKudosPayloadResponse,
  StudentKudosInfo,
  getStudentsKudos,
} from "util/api/courseApi";

type LeaderboardProps = {
  courseId: string;
};

const Leaderboard = ({ courseId }: LeaderboardProps): JSX.Element => {
  const authUser = useAuthUser();
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
  }, [authUser]);

  return (
    <div className="p-3 min-w-min max-w-lg">
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
              return (
                <ListItem key={person._id}>
                  <ListItemIcon>
                    <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
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
