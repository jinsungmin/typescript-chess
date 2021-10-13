import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { changeUser } from '../modules/user';

export default function useChangeUser() {
  const dispatch = useDispatch();
  return useCallback((email, username, win, lose) => dispatch(changeUser({email: email, username: username, win: win, lose: lose})), [dispatch]);
}