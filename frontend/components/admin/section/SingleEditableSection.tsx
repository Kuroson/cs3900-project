import React from "react";
import { toast } from "react-toastify";
import ImportContacts from "@mui/icons-material/ImportContacts";
import { TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { EditPanelButtons, ResourcesSection } from "components";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import {
  DeleteSectionPayloadRequest,
  UpdateSectionPayloadRequest,
  deleteSection,
  updateSection,
} from "util/api/pageApi";
import { ResourceInterface } from "models";
import { SectionFull } from "models/section.model";

type SingleEditableSectionProps = {
  section: SectionFull;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

const SingleEditableSection = ({
  section,
  sections,
  setSections,
  pageId,
  courseId,
}: SingleEditableSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [resources, setResources] = React.useState<ResourceInterface[]>(section.resources);
  const [dynamicTitle, setDynamicTitle] = React.useState(section.title);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    // If any values change in the upper components, update them here as well
    setResources(section.resources);
    setDynamicTitle(section.title);
  }, [section.resources, sections, section.title]);

  const handleEditClick = async () => {
    if (editMode) {
      if (dynamicTitle.length === 0) {
        toast.error("Section title cannot be empty");
        return;
      }

      const payload: UpdateSectionPayloadRequest = {
        sectionId: section._id,
        title: dynamicTitle,
        courseId: courseId,
        pageId: pageId,
      };

      const [res, err] = await updateSection(await authUser.getIdToken(), payload, "client");

      if (err !== null) {
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not update section title");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't have happened");
    }
    setEditMode(!editMode);
  };
  const handleRemoveClick = async () => {
    const payload: DeleteSectionPayloadRequest = {
      courseId: courseId,
      pageId: pageId,
      sectionId: section._id,
    };

    const [res, err] = await deleteSection(await authUser.getIdToken(), payload, "client");
    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not delete section");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't have happened");

    // update
    setSections(sections.filter((s) => s._id !== section._id));
    toast.success("Deleted section");
  };

  return (
    <div key={section._id}>
      <div className="w-full flex flex-col outline outline-[#F1F6EE] rounded-xl px-[2.5%] py-[2.5%] mb-5">
        <div className="flex flex-row">
          {editMode ? (
            <TextField
              id="Section Title"
              label="Section Title"
              variant="outlined"
              value={dynamicTitle}
              onChange={(e) => setDynamicTitle(e.target.value)}
            />
          ) : (
            <TitleWithIcon text={`Section: ${dynamicTitle}`}>
              <ImportContacts color="primary" />
            </TitleWithIcon>
          )}
          <div className="flex h-full items-center justify-center">
            <EditPanelButtons
              editMode={editMode}
              handleEditClick={handleEditClick}
              handleRemoveClick={handleRemoveClick}
            />
          </div>
        </div>
        <ResourcesSection
          resources={resources}
          setResources={setResources}
          pageId={pageId}
          courseId={courseId}
          sectionId={section._id}
        />
      </div>
    </div>
  );
};

export default SingleEditableSection;
