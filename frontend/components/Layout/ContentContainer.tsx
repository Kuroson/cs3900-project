type ContentContainerProps = {
  children: React.ReactNode;
};

export default function ContentContainer({ children }: ContentContainerProps): JSX.Element {
  return (
    <main className="w-full h-full flex justify-center items-center">
      <div className="w-full h-full max-w-screen-2xl">
        <div className="h-full w-full">{children}</div>
      </div>
    </main>
  );
}
