type ContentContainerProps = {
  children: React.ReactNode;
};

export default function ContentContainer({ children }: ContentContainerProps): JSX.Element {
  return (
    <div className="w-full h-full grid place-items-center">
      <div className="w-full h-full max-w-screen-2xl">
        <div className="px-6 h-full">{children}</div>
      </div>
    </div>
  );
}
