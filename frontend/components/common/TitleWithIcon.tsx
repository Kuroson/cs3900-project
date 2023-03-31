/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React from "react";
import { Box, Typography } from "@mui/material";

type PropsType = {
  children?: React.ReactNode;
  text: string;
};
const TitleWithIcon = ({ children, text }: PropsType) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
      {/* image/icon/avatar */}
      {children ? children : <span className="ml-9" />}
      <Typography variant="h6" fontWeight="600">
        {text}
      </Typography>
    </Box>
  );
};

export default TitleWithIcon;
