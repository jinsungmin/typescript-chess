import { deprecated } from 'typesafe-actions';

const { createStandardAction } = deprecated;

// 액션 type

export const CHANGE_LOGGED = 'LOGGEDs/CHANGE_LOGGED';

// 액션 생성 함수

export const changeLogged = createStandardAction(CHANGE_LOGGED)<{
    isLogged: boolean;
    id: string;
}>();
