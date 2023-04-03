import { List } from "@mui/material";
import { TaskInterface } from "models/task.model";
import AddNewTaskSection from "./AddNewTaskSection";
import SingleEditableTask from "./SingleEditableTask";

type TasksSectionProps = {
  weekId: string;
  tasks: TaskInterface[];
  setTasks: React.Dispatch<React.SetStateAction<TaskInterface[]>>;
};

const TasksSection = ({ weekId, tasks, setTasks }: TasksSectionProps): JSX.Element => {
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
          <AddNewTaskSection weekId={weekId} setTasks={setTasks} tasks={tasks} />
        </List>
      </div>
    </div>
  );
};

export default TasksSection;
