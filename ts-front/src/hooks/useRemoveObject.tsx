import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { removeObject } from '../modules/objects';

export default function useObjectActions() {
  const dispatch = useDispatch();

  return useCallback((id) => dispatch(removeObject({id:id})), [dispatch]);
}
