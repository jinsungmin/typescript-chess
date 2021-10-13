import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useHistory } from "react-router-dom";
import useChangeLogged from '../../hooks/useChangeLogged';
import useLogged from '../../hooks/useLogged';

import useChangeUser from '../../hooks/useChangeUser';
import useAddUser from '../../hooks/useAddUser';
import useUser from '../../hooks/useUser';
import { addUser, User } from '../../modules/user';
import { useCookies } from "react-cookie";
import queryString from 'query-string';
import io from 'socket.io-client';

import { Button, Image } from 'react-bootstrap';

import refresh_button from '../../images/refresh_button.png';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const ENDPOINT = 'localhost:8080';
let socket: any;

const Main = ({ location }: { location: any }) => {
	const Logged = useLogged();
	const User = useUser();
	const addUser = useAddUser();
	const changeUser = useChangeUser();
	const changeLogged = useChangeLogged();
	const [roomList, setroomList] = useState<any[]>([{ id: '', name: '' }]);
	const [userList, setUserList] = useState<any[]>([{ id: '', name: '' }]);

	const [request, setRequest] = useState(false);
	const [confirm, setConfirm] = useState({ type: 'send', username: null, roomID: null });

	let [cookies] = useCookies(["access_token"]);
	let history = useHistory();

	const readCookie = async () => {
		if (cookies.access_token) {
			// 쿠키에 access_token이 존재하면 로그인 상태 유지
			loadUser();

		} else {
			history.push("/");
		}
	}

	useEffect(() => {
		socket = io(ENDPOINT);

		readCookie();
	}, [])

	const loadUser = async () => {
		await axios.get(`/api/user/`)
			.then((res: any) => {
				if (User.length === 0) {
					addUser(res.data.user.email, res.data.user.username, res.data.user.win, res.data.user.lose);
				} else {
					changeUser(res.data.user.email, res.data.user.username, res.data.user.win, res.data.user.lose);
				}
				changeLogged(true, res.data.user.email);

			})
			.catch((error) => {
				alert(error.response.data.message);
			});
	}

	useEffect(() => {
		if (User.length) {
			socketio();
		}

	}, [ENDPOINT, location.search, User]);

	const socketio = () => {
		//socket = io(ENDPOINT);

		let name = User[0].username;
		console.log('name:', name);

		socket.emit('login', name, () => {
			//set_socket(!_socket);
		});

		return () => {
			socket.emit('disconnect');

			socket.off();
		}
	}

	useEffect(() => {
		socket.on('sendUser', ({ users }: any) => {
			setUserList(users);
		});
		console.log('userList:', userList);

	}, [userList]);

	useEffect(() => {
		socket.on('sendRoom', ({ rooms }: any) => {
			setroomList(rooms);
		});
		console.log('roomList:', roomList);

	}, [roomList]);

	useEffect(() => {
		socket.on('request', ({ fromUser, confirm, roomID }: any) => {
			setConfirm({ type: confirm, username: fromUser, roomID: roomID });
		});
	}, [request]);

	const handleRightClick = (name: string) => {	// 유저에게 match 요청

		if (name !== User[0].username) {
			socket.emit('requestMatch', { fromUser: User[0].username, toUser: name, confirm: confirm.type }, () => {
				loadUser();
				setRequest(!request);
			});
		}
	}

	useEffect(() => {
		if (confirm.type === 'receive') {
			let check = window.confirm(confirm.username + '의 요청을 수락하시겠습니까?');

			if (check) {
				socket.emit('requestMatch', { fromUser: User[0].username, toUser: confirm.username, confirm: 'receive' }, () => {
					//setConfirm({type: '', username: null});
					setRequest(!request);
				});
			}
		} else if (confirm.type === 'start') {
			history.push(`/game?roomID=${confirm.roomID}&username=${confirm.username}`);
		}
	}, [confirm]);

	const soloPlay = () => {
		history.push('/game/solo');
	}

	const signOut = async () => {
    await axios
      .post(`/api/auth/logout`)
      .then((res) => {
        console.log(res.data);
        cookies.access_token = null;

        alert("로그아웃 되었습니다.");
				
				history.push('/');

				window.location.reload();
      })
      .catch((error) => {
				alert(error.response.data.message);
				history.push('/');

				window.location.reload();
      });
  };

	return (
		<div>
			<div style={{ marginLeft: '5%', marginTop: '5%', width: '75%', height: '32rem', float: 'left', border: '2px solid black' }}>
				<ul className="list-group" style={{ overflow: 'auto' }}>
					{
						roomList.length ? roomList.map(room => {
							return (<li className="list-group-item">Room {room.id}</li>)
						}) : <li className="list-group-item">생성된 방이 없습니다.</li>
					}
				</ul>
			</div>
			<div style={{ marginTop: '5%', width: '16%', height: '8rem', float: 'left', borderTop: '2px solid black', borderRight: '2px solid black', borderBottom: '2px solid black', textAlign: 'center' }}>
				{User.length ? <div>
					<div>{User[0].username}</div>
					<div>Win: {User[0].win}</div>
					<div>Lose: {User[0].lose}</div>
				</div> : <div></div>
				}
				
				<Button style={{backgroundColor: 'white', border: 0, float: 'right', marginRight: '1rem'}}>
					<Image onClick={() => window.location.reload()}src={refresh_button} style={{width:'1.5rem', height: '1.5rem'}}/>
				</Button>
				
			</div>
			<div style={{ width: '16%', height: '24rem', float: 'left', borderRight: '2px solid black', borderBottom: '2px solid black', textAlign: 'center' }}>
				<ul className="list-group" style={{ overflow: 'auto' }}>
					{
						userList.map(user => {
							return (
								<div>
									<button onClick={() => handleRightClick(user.name)} style={{ borderBottom: '0.5px solid black', width: '6rem', backgroundColor: '#fffff1' }}>
										{user.name}
									</button>{/*
									<ContextMenuTrigger id="same_unique_identifier">
										<div style={{ height: '1.6rem' }}>{user.name}</div>
									</ContextMenuTrigger>
									<ContextMenu id="same_unique_identifier" style={{ border: '0.5px solid black' }}>
										<MenuItem>
											<button onClick={() => handleRightClick(user.name)} style={{ borderBottom: '0.5px solid black', width: '6rem', backgroundColor: '#fffff1' }}>
												대국 신청
											</button>
										</MenuItem>
										<MenuItem >
											<button onClick={() => handleRightClick(user.name)} style={{ borderBottom: '0.5px solid black', width: '6rem', backgroundColor: '#fffff1' }}>
												정보 보기
											</button>
										</MenuItem>
									</ContextMenu> */}
								</div>
							)
						})}
				</ul>
			</div>
			<div style={{ marginLeft: '5%', width: '100%' }}>
				<div style={{ marginRight: '5%', float: 'right', width: '15%' }}>
					<Button variant="dark" onClick={soloPlay} style={{width: '5rem', height:'2rem', marginTop: '0.5rem', textAlign: 'center', padding: '0rem'}}>혼자두기</Button>
				</div>
				<div style={{float: 'right', width: '15%'}}>
					<Button variant="dark" onClick={signOut} style={{width: '5rem', height:'2rem', marginTop: '0.5rem', textAlign: 'center', padding: '0rem'}}>로그아웃</Button>
				</div>
			</div>
		</div>
	)
}

export default Main;