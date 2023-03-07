import Head from "next/head";
import { ContentContainer, LeftSideBar, SideNavbar } from "components";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar empty={true} />
      <ContentContainer>
        <div className="w-full h-full flex items-center justify-center flex-col text-black">
          <h1 className="text-7xl font-bold">404</h1>
          <h2 className="text-3xl font-medium my-4">Page not found</h2>
          <p className="text-base">The page you were looking for could not be found.</p>
        </div>
      </ContentContainer>
      <LeftSideBar />
    </>
  );
}
