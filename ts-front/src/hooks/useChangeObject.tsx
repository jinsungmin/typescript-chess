import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { changeObject } from '../modules/objects';

export default function useChangeObject() {
  const dispatch = useDispatch();
  return useCallback((id, x, y, lived, isMoved, image, name) => dispatch(changeObject({id:id, x:x, y:y, lived:lived, isMoved: isMoved, image: image, name:name})), [dispatch]);
}