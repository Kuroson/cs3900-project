import React from "react";

type NoUserLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function NoUserLayout({ children, className }: NoUserLayoutProps): JSX.Element {
  return <div className={className}>{children}</div>;
}
