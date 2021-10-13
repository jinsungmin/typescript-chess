import { combineReducers } from 'redux';
import objects from './objects';
import logged from './logged';
import user from './user';

const rootReducer = combineReducers({
  objects,
  logged,
  user
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;