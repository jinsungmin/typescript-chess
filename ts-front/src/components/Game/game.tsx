import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import Cell from './cell';

import io from 'socket.io-client';
import queryString from 'query-string';

import {
  Button,
  Image
} from "react-bootstrap";

import lodash from 'lodash';

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
import useAddUser from '../../hooks/useAddUser';
import { isNotEmittedStatement } from 'typescript';

import Promotion from './promotion';
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

const Game = ({ location }: { location: any }) => {
  const User = useUser();
  const Objects = useObjects();
  const addObject = useAddObject();
  const changeObject = useChangeObject();
  const removeObject = useRemoveObject();
  const addUser = useAddUser();

  const [board, setBoard] = useState(grid);
  const [turn, setTurn] = useState(1);
  const [clicked, setClicked] = useState({ row: -1, col: -1 });
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');
  const [move, setMove] = useState(false);

  const [connected, setConnected] = useState(false);
  const [take, setTake] = useState(false);
  const [type, setType] = useState('');

  const [promotionColor, setPromotionColor] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');

  let history = useHistory();

  const ENDPOINT = 'localhost:8080';

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

    const { roomID, username } = queryString.parse(location.search);

    if (typeof (roomID) === 'string' && typeof (username) === 'string') {
      setRoomID(roomID);
      setUsername(username);
    }

    socket = io(ENDPOINT);

    socket.emit('roomConnect', { roomID: roomID, username: User[0].username }, () => {
      setConnected(!connected);
    });

    return () => {
      socket.emit('removeRoom', { roomID: roomID });
      socket.off();
    }
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    if (turn > 1) {
      judgeGame();
      judgeCheck();
      judgePromotion();
    }
  }, [turn]);

  useEffect(() => {
    socket.on('match', ({ roomID }: any) => {
      setRoomID(roomID);
      socket.emit('selectColor', { roomID: roomID }, () => {
        setTake(!take);
      })
    });
  }, [connected]);

  useEffect(() => {
    socket.on('setColor', ({ black, white, roomID }: any) => {
      setRoomID(roomID);

      axios.get(`/api/user/`)
        .then((res: any) => {
          if (black === res.data.user.username) {
            setType('black');
            setTurn(1);
          } else if (white === res.data.user.username) {
            setType('white');
            setTurn(1);
          }
          //setUsername(res.data.user.username);
        })
        .catch((error) => {
          alert(error.response.data.message);
        });
    })
  }, [take]);

  // 상대방의 움직임 반영
  useEffect(() => {
    socket.on('breakOut', ({ roomID }: any) => {
      alert('상대방이 기권하여 승리하였습니다.');
      setPromotionColor('gameSet');
    })
    socket.on('loadMove', ({ roomID, username, data, turn }: any) => {

      if (data.grid) {
        grid = data.grid;
        setBoard([...grid]);
      } else if (data.board) {
        grid = data.board;
        setBoard([...grid]);
      }

      // 상대방의 움직임에 따른 보드 변화
      if (data.inPassing) {
        console.log('inPassing:', data.inPassing);

        inPassing = data.inPassing;
      }

      setPromotionColor('');
      setPromotionMessage('');

      for (let i = 0; i < data.object.length; i++) {
        changeObject(data.object[i].id, data.object[i].row, data.object[i].col, data.object[i].lived, data.object[i].isMoved, data.object[i].image, data.object[i].name);
      }

      if (data.grid) {
        setTurn(turn);
      } else if (data.board) {
        setTurn(turn - 1);
      }
    });
  }, [move]);

  const clickControl = (rowIdx: number, colIdx: number) => {
    let grid = board;

    init(grid, 'click', 0);

    if (grid[rowIdx][colIdx].root) { // 이동 가능한 루트를 클릭했을 시
      const object: any = Objects.find((element) => { return element.y === clicked.row && element.x === clicked.col && element.lived });  // 선택했던 기물

      // 기물의 위치를 해당 위치로 수정
      const destObject: any = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });  // 목적지의 기물
      let objectName = '';

      let objectChange = [];

      if (destObject) {
        objectName = destObject.name;
        changeObject(destObject.id, colIdx, rowIdx, false, true, destObject.image, destObject.name);
        objectChange.push({ id: destObject.id, row: colIdx, col: rowIdx, lived: false, isMoved: true, object: objectName, image: destObject.image, name: destObject.name });
      }

      if (grid[clicked.row][colIdx].status === 'inPassing') {
        const inPassingObject: any = Objects.find((element) => { return element.y === clicked.row && element.x === inPassing.object.x && element.lived });  // 인파상으로 제거되는 기물

        if (inPassingObject) {
          changeObject(inPassingObject.id, null, null, false, true, inPassingObject.image, inPassingObject.name);
          objectChange.push({ id: inPassingObject.id, row: null, col: null, lived: false, isMoved: true, object: inPassingObject.name, image: inPassingObject.image, name: inPassingObject.name });

          grid[clicked.row][inPassing.object.x].object = true;
          grid[clicked.row][inPassing.object.x].root = false;
          grid[clicked.row][inPassing.object.x].image = '';

          //grid[clicked.row][colIdx].status = '';
          init(grid, 'status', '');
        }
      }

      if (object.name === 'pawn') {
        inPassing = { turn: turn, object: object };
      } else {
        inPassing = { turn: turn, object: null };
      }

      changeObject(object.id, colIdx, rowIdx, true, true, object.image, object.name);
      objectChange.push({ id: object.id, row: colIdx, col: rowIdx, lived: true, isMoved: true, object: objectName, image: object.image, name: object.name });

      if (object.name === 'king' || object.name === 'rook') {

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
                objectChange.push({ id: castling[i].id, row: castling[i].col, col: castling[i].row, lived: true, isMoved: true, object: castling[i].name, image: castling[i].image, name: castling[i].name });
              }
            }
          }
        }
      } else {
        castling = [];
      }

      grid[clicked.row][clicked.col].object = true;
      grid[clicked.row][clicked.col].color = 0;
      grid[rowIdx][colIdx].object = false;

      if (!object.color) {
        grid[rowIdx][colIdx].color = 1;
      } else {
        grid[rowIdx][colIdx].color = -1;
      }

      init(grid, 'root', false);

      let data = {
        grid: grid,
        object: objectChange,
        inPassing: inPassing,
      };

      setTurn(turn + 1);

      socket.emit('moveObject', { roomID: roomID, username: username, data: data, turn: turn }, () => {
        setMove(!move);
      })
    } else {
      grid[rowIdx][colIdx].click++;

      const object = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });

      setClicked({ row: rowIdx, col: colIdx });
      searchRoot(object, 'searchRoot');
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
        setPromotionMessage('흑 승급');
        setPromotionColor('black');
      } else {
        setPromotionMessage('백 승급');
        setPromotionColor('white');
      }
    }
  }

  const searchRoot = async (object: any, type: any) => {
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

        break;
      case 'knight':
        searchBoard = rootKnight(object, color, searchBoard);

        break;
      case 'rook':
        dir = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        searchBoard = rootFromDir(dir, object, color, searchBoard);

        if (type === 'searchRoot')
          searchBoard = await checkCastling(object, Objects, searchBoard, board, castling);

        break;
      case 'bishop':
        dir = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
        searchBoard = rootFromDir(dir, object, color, searchBoard);

        break;
      case 'king':
        dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];
        searchBoard = rootKing(dir, object, color, searchBoard);

        if (type === 'searchRoot')
          searchBoard = await checkCastling(object, Objects, searchBoard, board, castling);

        if (type === 'searchRoot')
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

  const judgeGame = async () => {
    const deadKing: any = Objects.find((element) => { return element.name === 'king' && !element.lived });

    if (deadKing) {
      if (!deadKing.color) { // 블랙
        alert('백 승');
        setPromotionColor('gameSet');
        let winner: boolean;
        if (type === 'white') {
          winner = true;
        } else {
          winner = false;
        }
        socket.emit('gameSet', { roomID: roomID, winner: winner, opponent: null }, () => {
        })
      } else {
        alert('흑 승');
        let winner: boolean;
        if (type === 'black') {
          winner = true;
        } else {
          winner = false;
        }
        socket.emit('gameSet', { roomID: roomID, winner: winner, opponent: null }, () => {
        })
        setPromotionColor('gameSet');
      }
    }
  }

  const avoidCheck = async (object: any, searchBoard: any) => {
    const objects: any = Objects.filter(element => object.color === !element.color && element.lived);

    await objects.map(async (element: any) => {
      let tBoard: any = await searchRoot(element, 'avoidCheck');
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
      console.log(element);
      let tBoard: any = await searchRoot(element, 'judgeCheck');
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

  const selectPromotion = (object: any): void => {
    const pawn: any = Objects.find((element) => { return (element.y === 0 || element.y === 7) && element.name === 'pawn' && element.lived });
    let objectChange = [];

    changeObject(pawn.id, pawn.x, pawn.y, true, true, object.image, object.name);
    objectChange.push({ id: pawn.id, row: pawn.y, col: pawn.x, lived: true, isMoved: true, object: object.name, image: object.image, name: object.name });

    let data = {
      object: objectChange,
      board: board,
    }

    setPromotionColor('');
    setPromotionMessage('');

    socket.emit('moveObject', { roomID: roomID, username: username, data: data, turn: turn }, () => {
      setMove(!move);
    })
  }

  const selectImage = (object: any, rowIdx: number, colIdx: number) => {
    if (object) {
      return object.image;
    } else {
      return board[rowIdx][colIdx].image;
    }
  }

  const checkDisabled = (rowIdx: number, colIdx: number) => {
    if ((type === 'black' && turn % 2 === 1) || (type === 'white' && turn % 2 === 0)) {
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
    } else {
      return true;
    }
  }

  const checkColor = (color: string, rowIdx: number, colIdx: number) => {
    if (board[rowIdx][colIdx].root) {
      return "#cccccc";
    } else {
      return color;
    }
  }

  const backToHome = () => {
    let check: boolean;
    if (promotionColor === 'gameSet') {
      check = window.confirm('방을 나가시겠습니까?');
    } else {
      check = window.confirm('방을 나가시겠습니까? 기권 처리됩니다.');
    }

    if (check) {
      if (promotionColor !== 'gameSet') {
        socket.emit('gameSet', { roomID: roomID, winner: false, opponent: username }, () => {
          setMove(!move);
        })
      }

      Objects.map(object => {
        removeObject(object.id);
      })

      history.push('/home');
      window.location.reload();
    }
  }

  const renderBoard = () => {
    return Array.apply(null, Array(BOARD_SIZE)).map((el, rowIdx) => {
      let cellList = Array.apply(null, Array(BOARD_SIZE)).map((el, colIdx) => {
        return (
          <div>
            {(rowIdx + colIdx) % 2 === 0 ? <button onClick={() => clickControl(rowIdx, colIdx)} disabled={promotionColor !== '' || checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#996600', rowIdx, colIdx), border: '1px solid black' }}>
              {Objects.map(object => { // 오브젝트 32개 탐색
                if (object.x === colIdx && object.y === rowIdx && object.lived) {
                  return <Image src={selectImage(object, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
                }
              })}
              {checkColor('#ffcc66', rowIdx, colIdx) === '#cccccc' && board[rowIdx][colIdx].object &&
                <Image src={selectImage(null, rowIdx, colIdx)} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px', opacity: '30%' }} />}
            </button> :
              <button onClick={() => clickControl(rowIdx, colIdx)} disabled={promotionColor !== '' || checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#ffcc66', rowIdx, colIdx), border: '1px solid black' }}>
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
          <div style={{ margin: '3%', width: '8rem' }}>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', fontStyle: 'italic' }}>
              Black Dead
            </div>
            <br />
            <div style={{ textAlign: 'left', height: '5rem', width: '8rem' }}>
              {Objects.map(object => {
                if (!object.lived && !object.color) {
                  return <img src={object.image} style={{ width: '1.5rem', height: '30px', paddingRight: '0.2rem' }} />
                }
              })}
            </div>
          </div>
          <div style={{ margin: '1rem', width: '8rem' }}>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', fontStyle: 'italic' }}>
              White Dead
            </div>
            <br />
            <div style={{ textAlign: 'left', height: '5rem', width: '8rem' }}>
              {Objects.map(object => {
                if (!object.lived && object.color) {
                  return <img src={object.image} style={{ width: '1.5rem', height: '30px', paddingRight: '0.2rem' }} />
                }
              })}
            </div>
          </div>
        </div>
        <div style={{ height: '10rem' }}>
          {type === promotionColor ? <Promotion color={promotionColor} selectPromotion={selectPromotion} /> :
            promotionMessage}
        </div>
        <div>
          <Button variant="dark" onClick={backToHome}>뒤로 가기</Button>
        </div>
      </div>
    </div>
  )
}

export default Game;