import { useRouter } from "next/router";
import Footer from "./Footer/Footer";
import styles from "./Layout.module.scss";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps): JSX.Element {
  const router = useRouter();
  // Get the current path
  const currentPath: string = router.asPath;
  const routes: string[] = ["login", "signup", "forgetPassword"];
  const inLoginPage: boolean = currentPath.split("/").some((word) => routes.includes(word));

  return <div className={inLoginPage ? styles.login_layout : styles.maincontent}>{children}</div>;
}
