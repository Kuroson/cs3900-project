import { TransitionGroup } from "react-transition-group";
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
    <div className="flex flex-col w-full mb-8">
      <List dense={true}>
        <TransitionGroup>
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
        </TransitionGroup>
      </List>
    </div>
  );
};

export default TasksSection;
