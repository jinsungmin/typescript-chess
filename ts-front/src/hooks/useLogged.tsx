import { useSelector } from 'react-redux';
import { RootState } from '../modules';

export default function useLogged() {
  const logged = useSelector((state: RootState) => state.logged);
  return logged;
}