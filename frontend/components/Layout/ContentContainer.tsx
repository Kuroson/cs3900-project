import Container from "@mui/material/Container";
import { Box } from "@mui/system";
import styles from "./Layout.module.scss";

type ContentContainerProps = {
  children: React.ReactNode;
};

export default function ContentContainer({ children }: ContentContainerProps): JSX.Element {
  return <div className={styles.container}>{children}</div>;
}
