import { createReducer } from "typesafe-actions";
import { CHANGE_LOGGED } from "./actions";
import { LoggedAction, LoggedState } from "./types";

// 초깃값 설정
const initialState: LoggedState = [{isLogged: false, id: ''}];

const logged = createReducer<LoggedState, LoggedAction>(initialState, {
  
  [CHANGE_LOGGED]: (state, { payload }) =>
    state.map(object => true ? ({ id: payload.id, isLogged: payload.isLogged }) : object),

});
export default logged;