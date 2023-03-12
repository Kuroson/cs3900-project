import React from "react";
import { Typography } from "@mui/material";

type PropsType = {
  children: React.ReactNode;
  text: string;
};

const TitleWithIcon = ({ children, text }: PropsType) => {
  return (
    <div className="flex items-center">
      {/* image/icon/avatar */}
      {children}
      <Typography variant="h6" fontWeight="600">
        {text}
      </Typography>
    </div>
  );
};

export default TitleWithIcon;
