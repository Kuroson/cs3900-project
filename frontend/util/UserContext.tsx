import React from "react";
import { UserDetails } from "models/user.model";

type UserContextProps = {
  userDetails: UserDetails | null;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  userCreationMode: boolean;
  setUserCreationMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = React.createContext<UserContextProps>({
  userDetails: null,
  setUserDetails: () => null,
  userCreationMode: false,
  setUserCreationMode: () => null,
});

type UserProviderProps = {
  children: React.ReactNode;
};

export const useUser = (): UserContextProps => {
  return React.useContext(UserContext);
};

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [user, setUser] = React.useState<UserDetails | null>(null);
  const [userCreationMode, setUserCreationMode] = React.useState(false); // Stops the reload of user data when user is being created in `/signup`

  const value = {
    userDetails: user,
    setUserDetails: setUser,
    userCreationMode,
    setUserCreationMode,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
