import React, { useEffect, useState } from 'react';

import {
	Button,
	Image,
} from "react-bootstrap";

import lodash from 'lodash';

import Promotion from './promotion';

import useObjects from '../../hooks/useObjects';
import useAddObject from '../../hooks/useAddObject';
import useChangeObject from '../../hooks/useChangeObject';

import black_king from '../../images/black_king.png';
import black_queen from '../../images/black_queen.png';
import black_rook from '../../images/black_rook.png';
import black_knight from '../../images/black_knight.png';
import black_bishop from '../../images/black_bishop.png';
import black_pawn from '../../images/black_pawn.png';

import white_king from '../../images/white_king.png';
import white_queen from '../../images/white_queen.png';
import white_rook from '../../images/white_rook.png';
import white_knight from '../../images/white_knight.png';
import white_bishop from '../../images/white_bishop.png';
import white_pawn from '../../images/white_pawn.png';
import { useHistory } from 'react-router-dom';
import useUser from '../../hooks/useUser';

import useRemoveObject from '../../hooks/useRemoveObject';
const { rootPawn, rootKnight, rootFromDir, rootKing, checkCastling, rootInPassing } = require('./rootFinding');

const CELL_SIZE = 60;
const BOARD_SIZE = 8;
const boardWidth = CELL_SIZE * BOARD_SIZE;

let socket: any;

let grid = Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
	return Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
		return { click: 0, object: true, root: false, color: 0, image: '', status: '' }
	});
});

for (var i = 0; i < BOARD_SIZE; i++) {
	grid[0][i].object = false;
	grid[1][i].object = false;
	grid[6][i].object = false;
	grid[7][i].object = false;

	grid[0][i].color = 1;
	grid[1][i].color = 1;
	grid[6][i].color = -1;
	grid[7][i].color = -1;
}

let castling: any = [];
let inPassing: any = null;

const GameSolo = () => {

	const removeObject = useRemoveObject();
	const Objects = useObjects();
	const addObject = useAddObject();
	const changeObject = useChangeObject();
	const [board, setBoard] = useState(grid);
	const [turn, setTurn] = useState(1);
	const [clicked, setClicked] = useState({ row: -1, col: -1 });
	const [promotionColor, setPromotionColor] = useState('');

	let history = useHistory();

	useEffect(() => {
		if (Objects.length < 32) {
			addObject('king', 4, 0, black_king, false);
			addObject('queen', 3, 0, black_queen, false);
			addObject('rook', 0, 0, black_rook, false);
			addObject('rook', 7, 0, black_rook, false);
			addObject('knight', 1, 0, black_knight, false);
			addObject('knight', 6, 0, black_knight, false);
			addObject('bishop', 2, 0, black_bishop, false);
			addObject('bishop', 5, 0, black_bishop, false);

			addObject('king', 4, 7, white_king, true);
			addObject('queen', 3, 7, white_queen, true);
			addObject('rook', 0, 7, white_rook, true);
			addObject('rook', 7, 7, white_rook, true);


			addObject('knight', 1, 7, white_knight, true);
			addObject('knight', 6, 7, white_knight, true);
			addObject('bishop', 2, 7, white_bishop, true);
			addObject('bishop', 5, 7, white_bishop, true);

			for (var i = 0; i < 8; i++) {
				addObject('pawn', i, 1, black_pawn, false);
				addObject('pawn', i, 6, white_pawn, true);
			}
		}
		console.log('reload');
	}, [])

	useEffect(() => {
		if (turn > 1) {
			judgeCheck();
			judgePromotion();
		}
	}, [turn])

	const clickControl = (rowIdx: number, colIdx: number) => {
		console.log(rowIdx, colIdx);
		let grid = board;
	
		init(grid, 'click', 0);
		init(grid, 'image', '');

		if (grid[rowIdx][colIdx].root) { // 이동 가능한 루트를 클릭했을 시
			const object: any = Objects.find((element) => { return element.y === clicked.row && element.x === clicked.col && element.lived });  // 선택했던 기물

			// 기물의 위치를 해당 위치로 수정
			const destObject: any = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });  // 목적지의 기물
			let objectName = '';

			if (destObject) {
				objectName = destObject.name;
				changeObject(destObject.id, colIdx, rowIdx, false, true, destObject.image, destObject.name);
			}

			if (grid[clicked.row][colIdx].status === 'inPassing') {
				const inPassingObject: any = Objects.find((element) => { return element.y === clicked.row && element.x === inPassing.object.x && element.lived });  // 인파상으로 제거되는 기물

				if (inPassingObject) {
					console.log('pass:', inPassingObject);
					changeObject(inPassingObject.id, null, null, false, true, inPassingObject.image, inPassingObject.name);

					grid[clicked.row][inPassing.object.x].object = true;
					grid[clicked.row][inPassing.object.x].root = false;
					grid[clicked.row][inPassing.object.x].image = '';

					grid[clicked.row][colIdx].status = '';
				}
			}

			changeObject(object.id, colIdx, rowIdx, true, true, object.image, object.name);

			if (object.name === 'pawn') {
				inPassing = { turn: turn, object: object };
			} else {
				inPassing = { turn: turn, object: null };
			}

			if((object.name === 'rook' && ((rowIdx === 0 && colIdx === 5) || (rowIdx === 0 && colIdx === 3) || (rowIdx === 7 && colIdx === 3) || (rowIdx === 7 && colIdx === 5))) ||
				(object.name === 'king' && ((rowIdx === 0 && colIdx === 6) || (rowIdx === 0 && colIdx === 2) || (rowIdx === 7 && colIdx === 6) || (rowIdx === 7 && colIdx === 2)))) {
					if (castling.length) {
						let check: boolean = true;
						if (castling[0].name === 'king') {
							check = window.confirm('캐슬링 하시겠습니까?');
						}
		
						if (check) {
							for (let i = 0; i < castling.length; i++) {
								if (castling[i].checked) {
									if (castling[i].color === false) {
										grid[castling[i].row][castling[i].col].color = 1;
		
									} else {
										grid[castling[i].row][castling[i].col].color = -1;
									}
									grid[castling[i].row][castling[i].col].object = false;
		
									const tempObject: any = Objects.find((element) => { return element.id === castling[i].id });  // 캐슬링 대상의 기물
		
									console.log('log:', castling[i]);
		
									grid[tempObject.y][tempObject.x].color = 0;
									grid[tempObject.y][tempObject.x].object = true;


		
									changeObject(castling[i].id, castling[i].col, castling[i].row, true, true, castling[i].image, castling[i].name);
								}
							}
						}
					}
			}
			
			grid[clicked.row][clicked.col].object = true;
			grid[clicked.row][clicked.col].color = 0;
			grid[rowIdx][colIdx].object = false;

			if (!object.color) {
				grid[rowIdx][colIdx].color = 1;
			} else {
				grid[rowIdx][colIdx].color = -1;
			}

			if (objectName === 'king') {
				alert('game set');
			}

			setTurn(turn + 1);

			init(grid, 'root', false);

			castling = [];
		} else {
			grid[rowIdx][colIdx].click++;

			//setBoard([...grid]);

			const object = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });

			//console.log(object);

			castling = [];
			setClicked({ row: rowIdx, col: colIdx });

			//let searchBoard: any = searchRoot(board, object, 'searchRoot');
			searchRoot(board, object, 'searchRoot');
		}
	}

	const init = (object: any, attr: any, value: any) => {
		for (var i = 0; i < BOARD_SIZE; i++) {
			for (var j = 0; j < BOARD_SIZE; j++) {
				if (object[i][j][attr]) {
					object[i][j][attr] = value;
				}
			}
		}
	}

	const judgePromotion = () => {
		const object = Objects.find((element) => { return (element.y === 0 || element.y === 7) && element.name === 'pawn' && element.lived });
		if (object) {
			if (!object.color) {
				alert('흑 승급');
				setPromotionColor('black');
			} else {
				alert('백 승급');
				setPromotionColor('white');
			}
		}
	}

	const searchRoot = async (board:any, object: any, type: any) => {
		let searchBoard = lodash.cloneDeep(board);

		init(searchBoard, 'root', false);

		let color: number = 0;
		let initPos = 0;
		let dir: any;

		if (object.color) {
			color = -1;
			initPos = 7;
		} else {
			initPos = 0;
			color = 1;
		}

		switch (object.name) {
			case 'pawn':
				searchBoard = rootPawn(object, initPos, color, searchBoard, type);

				if (type === 'searchRoot')
					searchBoard = rootInPassing(object, searchBoard, inPassing);
				// 앙파상, 승진 구현
				break;
			case 'knight':
				searchBoard = rootKnight(object, color, searchBoard);
				break;
			case 'rook':
				dir = [[-1, 0], [1, 0], [0, 1], [0, -1]];
				searchBoard = rootFromDir(dir, object, color, searchBoard);

				if(type === 'searchRoot')
					searchBoard = await checkCastling(object, Objects, searchBoard, board, castling);
				break;
			case 'bishop':
				dir = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
				searchBoard = rootFromDir(dir, object, color, searchBoard);
				break;
			case 'king':
				dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];

				searchBoard = rootKing(dir, object, color, searchBoard);

				if(type === 'searchRoot')
					searchBoard = await checkCastling(object, Objects, searchBoard, board, castling);

				if(type === 'searchRoot')
					searchBoard = await avoidCheck(object, searchBoard);

				break;
			case 'queen':
				dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];
				searchBoard = rootFromDir(dir, object, color, searchBoard);
				break;
			default:
				break;
		}

		if (type === 'searchRoot') {
			setBoard([...searchBoard]);
			return null;
		} else if (type !== 'searchRoot') {
			return searchBoard;
		}
	}

	const avoidCheck = async (object: any, searchBoard: any) => {
		const objects: any = Objects.filter(element => object.color === !element.color && element.lived);

		await objects.map(async (element: any) => {
			let tBoard: any = await searchRoot(board, element, 'avoidCheck');
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if (tBoard[i][j].root && searchBoard[i][j].root) {
						searchBoard[i][j].root = false;
					}
				}
			}
		})
		
		return searchBoard;
	}

	// 본인의 턴에 체크 상태인지 확인하는 함수
	const judgeCheck = async () => {
		let checkBoard = Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
			return Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
				return { root: false }
			});
		});

		const king: any = Objects.find((element) => { return element.name === 'king' && turn % 2 === 1 ? element.color === false : element.color === true });

		const objects: any = Objects.filter(element => turn % 2 === 1 ? element.color === true && element.lived : element.color === false && element.lived);

		await objects.map(async (element: any) => {
			let tBoard: any = await searchRoot(board, element, 'judgeCheck');
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if (tBoard[i][j].root) {
						checkBoard[i][j].root = true;
					}
				}
			}
		})
		if (checkBoard[king.y][king.x].root) {
			alert('check!');
		}
	}

	const checkDisabled = (rowIdx: number, colIdx: number) => {
		if (board[rowIdx][colIdx].object) {
			if (board[rowIdx][colIdx].root) {
				return false;
			} else {
				return true;
			}
		} else {
			if (board[rowIdx][colIdx].root) {
				return false;
			}
			if ((board[rowIdx][colIdx].color === 1 && (turn % 2) === 1) || (board[rowIdx][colIdx].color === -1 && (turn % 2) === 0)) {
				return false;
			} else {
				return true;
			}
		}
	}

	const checkColor = (color: string, rowIdx: number, colIdx: number) => {
		if (board[rowIdx][colIdx].root) {
			return '#cccccc';
		} else {
			return color;
		}
	}

	const backToHome = () => {
		Objects.map(object => {
			removeObject(object.id);
		})

		history.push('/home');
		window.location.reload();
	}

	const selectPromotion = (object: any): void => {
		const pawn: any = Objects.find((element) => { return (element.y === 0 || element.y === 7) && element.name === 'pawn' && element.lived });
		
		changeObject(pawn.id, pawn.x, pawn.y, true, true, object.image, object.name);

		setPromotionColor('');
	}

	const selectImage = (object: any, rowIdx: number, colIdx: number) => {
		if (object) {
			return object.image;
		} else {
			return board[rowIdx][colIdx].image;
		}
	}

	const renderBoard = () => {
		return Array.apply(null, Array(BOARD_SIZE)).map((el, rowIdx) => {
			let cellList = Array.apply(null, Array(BOARD_SIZE)).map((el, colIdx) => {
				return (
					<div>
						{(rowIdx + colIdx) % 2 === 0 ? <button onClick={() => clickControl(rowIdx, colIdx)} disabled={promotionColor !== '' || checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#ffcc66', rowIdx, colIdx), border: '1px solid black' }}>
							{Objects.map(object => { // 오브젝트 32개 탐색
								if (object.x === colIdx && object.y === rowIdx && object.lived) {
									return <Image src={selectImage(object, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
								}
							})}
							{checkColor('#ffcc66', rowIdx, colIdx) === '#cccccc' && board[rowIdx][colIdx].object &&
								<Image src={selectImage(null, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px', opacity: '30%' }} />}
						</button> :
							<button onClick={() => clickControl(rowIdx, colIdx)} disabled={promotionColor !== '' || checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#996600', rowIdx, colIdx), border: '1px solid black' }}>
								{Objects.map(object => { // 오브젝트 32개 탐색
									if (object.x === colIdx && object.y === rowIdx && object.lived) {
										return <Image src={selectImage(object, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
									}
								})}
								{checkColor('#996600', rowIdx, colIdx) === '#cccccc' && board[rowIdx][colIdx].object &&
									<Image src={selectImage(null, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px', opacity: '30%' }} />}
							</button>
						}
					</div>
				)
			});

			return (
				<div
					key={rowIdx}
					style={{
						width: boardWidth,
						height: CELL_SIZE,
						display: 'flex',
						alignItems: 'flex-start'
					}}>
					{cellList}
				</div>
			)
		});
	}

	return (
		<div>
			<div style={{ marginLeft: '5%', marginTop: '5%', float: 'left' }}>
				{renderBoard()}
			</div>
			<div style={{ marginLeft: '3%', marginTop: '5%', float: 'left', width: '35%', textAlign: 'center' }}>
				<div style={{ height: '5rem' }}>
					{turn % 2 === 1 ? <div style={{ fontSize: '1.5rem' }}>BLACK TURN {turn}</div> : <div style={{ fontSize: '1.5rem' }}>WHITE TURN {turn}</div>}
				</div>
				<div className="row h-100 justify-content-center align-items-center">
          <div style={{margin: '3%', width: '8rem'}}>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', fontStyle: 'italic' }}>
              Black Dead
            </div>
						<br/>
            <div style={{ textAlign: 'left', height: '5rem', width: '8rem' }}>
              {Objects.map(object => {
                if (!object.lived && !object.color) {
                  return <img src={object.image} style={{ width: '1.5rem', height: '30px', paddingRight: '0.2rem' }} />
                }
              })}
            </div>
          </div>
          <div style={{margin: '1rem', width: '8rem'}}>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', fontStyle: 'italic'}}>
              White Dead
            </div>
						<br/>
            <div style={{ textAlign: 'left', height: '5rem', width: '8rem'}}>
              {Objects.map(object => {
                if (!object.lived && object.color) {
                  return <img src={object.image} style={{ width: '1.5rem', height: '30px', paddingRight: '0.2rem' }} />
                }
              })}
            </div>
          </div>
        </div>
				<div style={{ height: '10rem' }}>
					<Promotion color={promotionColor} selectPromotion={selectPromotion}/>
				</div>
				<div>
					<Button variant="dark" onClick={backToHome}>뒤로 가기</Button>
				</div>
			</div>
		</div>
	)
}

export default GameSolo;