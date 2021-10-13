import { useSelector } from 'react-redux';
import { RootState } from '../modules';

export default function useObjects() {
  const objects = useSelector((state: RootState) => state.objects);
  return objects;
}