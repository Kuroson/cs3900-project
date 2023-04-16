import { List } from "@mui/material";
import { FullTaskInterface, TaskInterface } from "models/task.model";
import SingleCompleteTask from "./SingleCompleteTask";
import SingleUncompleteTask from "./SingleUncompleteTask";
import SingleTask from "./SingleUncompleteTask";

type StudentTasksSectionProps = {
  completedTasks: FullTaskInterface[] | undefined;
  uncompletedTasks: FullTaskInterface[] | undefined;
  courseId: string;
  weekId: string;
  studentId: string;
};

const StudentTasksSection = ({
  completedTasks,
  uncompletedTasks,
  courseId,
  weekId,
  studentId,
}: StudentTasksSectionProps): JSX.Element => {
  return (
    <div>
      <div className="flex flex-col w-full">
        {completedTasks !== undefined && (
          <List>
            {completedTasks.map((task) => {
              return <SingleCompleteTask task={task} key={task._id} />;
            })}
          </List>
        )}
        {uncompletedTasks !== undefined && (
          <List>
            {uncompletedTasks.map((task) => {
              return (
                <SingleUncompleteTask
                  courseId={courseId}
                  weekId={weekId}
                  task={task}
                  key={task._id}
                  studentId={studentId}
                />
              );
            })}
          </List>
        )}
      </div>
    </div>
  );
};

export default StudentTasksSection;
