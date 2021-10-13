import { deprecated } from 'typesafe-actions';

const { createStandardAction } = deprecated;

// 액션 type
export const ADD_OBJECT = 'OBJECTs/ADD_OBJECT';
export const TOGGLE_OBJECT = 'OBJECTs/TOGGLE_OBJECT';
export const REMOVE_OBJECT = 'OBJECTs/REMOVE_OBJECT';
export const CHANGE_OBJECT = 'OBJECTs/CHANGE_OBJECT';

// 액션 생성 함수
export const addObject = createStandardAction(ADD_OBJECT)<{
    name: string;
    x: number;
    y: number;
    image: string;
    color: boolean;
}>();

export const changeObject = createStandardAction(CHANGE_OBJECT)<{
    id: number | undefined;
    x: number;
    y: number;
    lived: boolean;
    isMoved: boolean;
    image: string;
    name: string;
}>();

export const toggleObject = createStandardAction(TOGGLE_OBJECT)<number>();
export const removeObject = createStandardAction(REMOVE_OBJECT)<{
    id: number | undefined;
}>();
