import { List } from "@mui/material";
import { TaskInterface } from "models/task.model";
import SingleTask from "./SingleTask";

type StudentTasksSectionProps = {
  tasks: TaskInterface[];
};

const StudentTasksSection = ({ tasks }: StudentTasksSectionProps): JSX.Element => {
  return (
    <div>
      <div className="flex flex-col w-full">
        <List dense={true}>
          {tasks.map((task) => {
            return <SingleTask task={task} key={task._id} />;
          })}
        </List>
      </div>
    </div>
  );
};

export default StudentTasksSection;
