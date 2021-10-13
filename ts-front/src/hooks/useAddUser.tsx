import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { addUser } from '../modules/user';

export default function useAddUser() {
  const dispatch = useDispatch();
  return useCallback((email, username, win, lose) => dispatch(addUser({email:email, username: username, win:win, lose:lose})), [dispatch]);
}