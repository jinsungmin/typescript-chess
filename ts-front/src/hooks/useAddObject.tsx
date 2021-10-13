import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { addObject } from '../modules/objects';

export default function useAddObject() {
  const dispatch = useDispatch();
  return useCallback((name, x, y, image, color) => dispatch(addObject({name:name, x:x, y:y, image:image, color:color})), [dispatch]);
}