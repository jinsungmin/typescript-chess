import { createReducer } from "typesafe-actions";
import { ADD_OBJECT, REMOVE_OBJECT, TOGGLE_OBJECT, CHANGE_OBJECT } from "./actions";
import { ObjectsAction, ObjectsState } from "./types";

// 초깃값 설정
const initialState: ObjectsState = [];

let startNum = 0;

const objects = createReducer<ObjectsState, ObjectsAction>(initialState, {
  [ADD_OBJECT]: (state, { payload }) =>
    state.concat({
      id: startNum++,
      name: payload.name,
      x: payload.x,
      y: payload.y,
      lived: true,
      color: payload.color,
      image: payload.image,
      isMoved: false,
    }),
  [TOGGLE_OBJECT]: (state, { payload: id }) =>
    state.map(object => (object.id === id ? { ...object, lived: !object.lived } : object)),
  [REMOVE_OBJECT]: (state, { payload }) =>
    state.filter(object => object.id !== payload.id),
  [CHANGE_OBJECT]: (state, { payload }) =>
    state.map(object => (object.id === payload.id ? { ...object, lived: payload.lived, x: payload.x, y: payload.y, isMoved: payload.isMoved, image: payload.image, name: payload.name } : object)),
});
export default objects;