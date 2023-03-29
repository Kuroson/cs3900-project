import React, { ReactNode } from "react";

type PageHeaderProps = { title: string; children?: ReactNode };

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }): JSX.Element => {
  return (
    <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between py-2">
      <div className="flex items-center gap-4">
        <span className="ml-4">{title}</span>
      </div>
      {children}
    </h1>
  );
};

export default PageHeader;
