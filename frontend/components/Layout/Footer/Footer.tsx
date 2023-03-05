import { ContentContainer } from "components";
import styles from "../Layout.module.scss";

export default function Footer(): JSX.Element {
  return (
    <div className={styles.footer}>
      <div className="w-full h-full bg-blue-400">
        <ContentContainer>
          <div className="h-full grid place-items-center">
            <p className="font-light">This is footer</p>
          </div>
        </ContentContainer>
      </div>
    </div>
  );
}
