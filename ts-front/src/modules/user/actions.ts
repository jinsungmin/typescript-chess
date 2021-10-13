import { deprecated } from 'typesafe-actions';

const { createStandardAction } = deprecated;

// 액션 type
export const ADD_USER = 'USERs/ADD_USER';
export const CHANGE_USER = 'USERs/CHANGE_USER';

// 액션 생성 함수
export const addUser = createStandardAction(ADD_USER)<{
    email: string;
    username: string;
    win: number;
    lose: number;
}>();

export const changeUser = createStandardAction(CHANGE_USER)<{
    email: string;
    username: string;
    win: number;
    lose: number;
}>();
