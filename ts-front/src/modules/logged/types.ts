import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type LoggedAction = ActionType<typeof actions>;

export type Logged = {
  isLogged: boolean;
  id: string;
};

export type LoggedState = Logged[];