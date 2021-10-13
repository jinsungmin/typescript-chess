import { unstable_renderSubtreeIntoContainer } from "react-dom";
import { createReducer } from "typesafe-actions";
import { setConstantValue } from "typescript";
import { ADD_USER, CHANGE_USER } from "./actions";
import { UserAction, UserState } from "./types";

// 초깃값 설정
const initialState: UserState = [];

const user = createReducer<UserState, UserAction>(initialState, {
  [ADD_USER]: (state, { payload }) =>
    state.concat({
      email: payload.email,
      username: payload.username,
      win: payload.win,
      lose: payload.lose,
    }), 
  [CHANGE_USER]: (state, { payload }) =>
    state.map(user => true ? ({ email: payload.email, username: payload.username, win: payload.win, lose: payload.lose }) : user),
});
export default user;