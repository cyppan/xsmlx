import React from 'react';

type IUserContext = {
  username: string | null;
  setUsername: (username: string) => void;
  isEditingUsername: boolean;
  setIsEditingUsername: (b: boolean) => void;
};
export const UserContext = React.createContext<IUserContext>({
  username: localStorage.getItem('username'),
  setUsername: (username: string) => {},
  isEditingUsername: false,
  setIsEditingUsername: (b: boolean) => {},
});
