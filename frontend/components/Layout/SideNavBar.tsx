import { useState } from "react";
import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import TitleWithIcon from "components/common/TitleWithIcon";

type SideNavBarProps = UserDetailsProps & {
  empty?: boolean;
  list: Routes[]; // sidebar sections list
  isCoursePage?: boolean; // check if the current page is course page
  courseCode?: string;
  courseIcon?: string;
};

type UserDetailsProps = {
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  avatarURL?: string | null;
};

export type Routes = {
  name: string;
  route: string;
  Icon?: React.ReactNode;
  hasLine?: boolean;
};

const UserDetails = ({ firstName, lastName, role, avatarURL }: UserDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-2xl font-bold">
          {(firstName?.charAt(0) ?? "") + (lastName?.charAt(0) ?? "")}
        </span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${firstName} ${lastName}`}</span>
        <span className="text-start w-full">{role}</span>
      </div>
    </div>
  );
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  width: "400px",
};

const NavBar = ({
  routes,
  isCoursePage,
}: {
  routes: Routes[];
  isCoursePage: boolean;
}): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [radio, setRadio] = useState("");
  const [sectionName, setSectionName] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const routesNames = routes.map((route) => route.name);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadio((event.target as HTMLInputElement).value);
  };

  const handleAddNewPage = () => {
    handleClose();
    if (radio === "Other Section") {
      routes.push({
        name: sectionName,
        route: "/admin",
      });
    } else {
      routes.push({
        name: radio,
        route: "/admin",
      });
    }
    setSectionName("");
    setRadio("");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 pl-2">
      {routes?.map(({ name, route, Icon, hasLine }, index) => {
        return (
          <div key={`nav-index-${index}`} className="w-full flex py-2 flex-col">
            <Link href={route}>
              <TitleWithIcon text={name}>{Icon}</TitleWithIcon>
            </Link>
            {(hasLine ?? false) && <Divider light sx={{ width: "100%", marginTop: "10px" }} />}
          </div>
        );
      })}
      {/* TODO: check if user is admin as well */}
      {isCoursePage && (
        <Button variant="outlined" onClick={handleOpen}>
          Add New Page
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormControl sx={style}>
          <FormLabel id="add new page">Add new Page</FormLabel>
          <RadioGroup
            aria-labelledby="select new page"
            defaultValue=""
            name="new pages"
            onChange={handleRadioChange}
            value={radio}
          >
            <FormControlLabel
              value="Assignment"
              control={<Radio disabled={routesNames.includes("Assignment")} />}
              label="Assignment"
            />
            <FormControlLabel
              value="Quiz"
              control={<Radio disabled={routesNames.includes("Quiz")} />}
              label="Quiz"
            />
            <FormControlLabel
              value="Forum"
              control={<Radio disabled={routesNames.includes("Forum")} />}
              label="Forum"
            />
            <FormControlLabel value="Other Section" control={<Radio />} label="Other Section" />
            <TextField
              disabled={radio !== "Other Section"}
              id="Section Name"
              label="Section Name"
              variant="standard"
              sx={{ marginLeft: "30px" }}
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
          </RadioGroup>
          <Button
            variant="contained"
            sx={{ marginTop: "30px" }}
            onClick={handleAddNewPage}
            disabled={radio === "Other Section" && sectionName === ""}
          >
            Add new page
          </Button>
        </FormControl>
      </Modal>
    </div>
  );
};

export default function SideNavbar({
  empty,
  firstName,
  lastName,
  role,
  avatarURL,
  list,
  isCoursePage,
  courseCode,
  courseIcon,
}: SideNavBarProps): JSX.Element {
  if (empty === true) {
    return <div></div>;
  }

  const handleOnClick = async () => {
    signOut(getAuth());
  };

  return (
    <div className="w-full">
      <div
        className="h-full fixed top-[0] left-[0] z-10 w-[13rem]"
        // 13rem matches Layout.module.scss
      >
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            {isCoursePage ?? false ? (
              <div className="flex flex-col items-center justify-center gap-2 my-2">
                <Link href="/admin" className="mr-8">
                  <TitleWithIcon text="Dashborad">
                    <ArrowBackIosIcon />
                  </TitleWithIcon>
                </Link>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={courseIcon ?? "" ? courseIcon : "/static/images/avatar/3.jpg"}
                    alt="Course Icon"
                  />
                  <h2>{courseCode}</h2>
                </div>
              </div>
            ) : (
              <UserDetails
                firstName={firstName}
                lastName={lastName}
                role={role}
                avatarURL={avatarURL}
              />
            )}
            <NavBar routes={list} isCoursePage={isCoursePage ?? false} />
          </div>
          <div className="flex justify-center items-center mb-5">
            {/* Bottom */}
            <Button variant="outlined" onClick={handleOnClick} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
