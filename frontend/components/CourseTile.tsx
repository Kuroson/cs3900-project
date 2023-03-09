import Link from "next/link";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";

type CourseTileProps = {
  courseCode?: string;
  courseName?: string;
  courseDescription?: string | null;
  courseIconURL?: string | null;
  courseURL?: string;
};

const CourseTileDetails = ({ courseCode, courseName, courseDescription, courseIconURL, courseURL }: CourseTileProps): JSX.Element => {
  const styles = {
    courselink: {
      "font-weight": "bold",
    },
    coursename: {
      "font-style": "italic"
    },
    coursedesc: {

    }
  };
  return (
    <div>
      <div>
        <Link
          href={`${courseURL}`}
        >
          <div>
            <span style={styles.courselink}>{courseCode}</span>
          </div>
        </Link>
        <span style={styles.coursename}>{courseName}</span><br></br>
        <span style={styles.coursedesc}>{courseDescription}</span>        
      </div>
    </div>
  );
};

export default function CourseTile({
  courseCode,
  courseName,
  courseDescription,
  courseIconURL,
  courseURL
}: CourseTileProps): JSX.Element {
  const styles = {
    tile: {
      outline: "thin solid #D3D3D3",
      "border-radius": "10px",
      width: "35%",
      height: "200px",
      padding: "20px",
      margin: "15px",
      "float": "left"
    },
  };
  return (
    <div className="" style={styles.tile}>
      <div>
        <CourseTileDetails 
          courseName={courseName}
          courseCode={courseCode}
          courseDescription={courseDescription}
          courseIconURL={courseIconURL}
          courseURL={courseURL}
        />
      </div>
    </div>
  );
}
