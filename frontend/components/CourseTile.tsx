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
  return (
    <div>
      <div>
        <Link
          href={`${courseURL}`}
        >
          <div>
            <span style={{fontWeight: "bold"}}>{courseCode}</span>
          </div>
        </Link>
        <span style={{fontStyle: "italic"}}>{courseName}</span><br></br>
        <span>{courseDescription}</span>        
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
  return (
    <div className="course-tiles" style={
      { outline: 'thin solid #D3D3D3', borderRadius: 10, width: '35%',
        height: 200,
        padding: 20,
        margin: 15,
        float: "left"
      }}>
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
