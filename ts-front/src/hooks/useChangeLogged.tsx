import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { changeLogged } from '../modules/logged';

export default function useChangeLogged() {
  const dispatch = useDispatch();
  return useCallback((isLogged, id) => dispatch(changeLogged({isLogged: isLogged, id: id})), [dispatch]);
}