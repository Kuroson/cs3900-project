import { List } from "@mui/material";
import { OnlineClassInterface } from "models/onlineClass.model";
import { TaskInterface } from "models/task.model";
import AddNewTaskSection from "./AddNewTaskSection";
import SingleEditableTask from "./SingleEditableTask";

type TasksSectionProps = {
  courseId: string;
  weekId: string;
  tasks: TaskInterface[];
  setTasks: React.Dispatch<React.SetStateAction<TaskInterface[]>>;
  onlineClasses: OnlineClassInterface[];
  setOnlineClasses: React.Dispatch<React.SetStateAction<OnlineClassInterface[]>>;
};

const TasksSection = ({
  courseId,
  weekId,
  tasks,
  setTasks,
  onlineClasses,
  setOnlineClasses,
}: TasksSectionProps): JSX.Element => {
  return (
    <div>
      <div className="flex flex-col w-full">
        <List dense={true}>
          {tasks.map((task) => {
            return (
              <SingleEditableTask
                task={task}
                key={task._id}
                setTasks={setTasks}
                weekId={weekId}
                tasks={tasks}
              />
            );
          })}
          <AddNewTaskSection
            courseId={courseId}
            weekId={weekId}
            setTasks={setTasks}
            tasks={tasks}
            onlineClasses={onlineClasses}
            setOnlineClasses={setOnlineClasses}
          />
        </List>
      </div>
    </div>
  );
};

export default TasksSection;
