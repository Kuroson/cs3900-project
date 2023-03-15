type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Layout({ children, className }: LayoutProps): JSX.Element {
  return <div className={className}>{children}</div>;
}
