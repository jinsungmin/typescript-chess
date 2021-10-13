import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type UserAction = ActionType<typeof actions>;

export type User = {
  email: string;
  username: string;
  win: number;
  lose: number;
};

export type UserState = User[];