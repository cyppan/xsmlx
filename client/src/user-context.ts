import React from 'react';

type IUserContext = {
  username: string | null;
  setUsername: (username: string) => void;
};
export const UserContext = React.createContext<IUserContext>({
  username: localStorage.getItem('user'),
  setUsername: (username: string) => {},
});
