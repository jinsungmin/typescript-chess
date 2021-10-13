import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type ObjectsAction = ActionType<typeof actions>;

export type Object = {
  id: number | undefined;
  name: string;
  x: number;
  y: number;
  lived: boolean;
  color: boolean;
  image: string;
  isMoved: boolean;
};

export type ObjectsState = Object[];