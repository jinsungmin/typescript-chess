import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { useHistory } from "react-router-dom";
import useChangeLogged from '../../hooks/useChangeLogged';
import useLogged from '../../hooks/useLogged';

import useChangeUser from '../../hooks/useChangeUser';
import useAddUser from '../../hooks/useAddUser';
import useUser from '../../hooks/useUser';
import { User } from '../../modules/user';

import {
  Button,
  Form,
  Card,
  Image,
} from "react-bootstrap";

import chess_image from '../../images/chess.jpg';

import { useCookies } from "react-cookie";
import { set } from "js-cookie";

const Init = () => {
  const Logged = useLogged();
  const User = useUser();
  const addUser = useAddUser();

  const changeLogged = useChangeLogged();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let history = useHistory();

  const submitHandler = (event: any): void => {
    event.preventDefault();

    const user = {
      email: email,
      password: password,
    };

    axios
      .post(`/api/auth/login`, user)
      .then((res: any) => {
        console.log('data:', res.data);

        changeLogged(true, email);
        addUser(res.data.user.email, res.data.user.username, res.data.user.win, res.data.user.lose);
        history.push("/home");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });

    //console.log(User);
  };

  return (
    <div>
      <div style={{ width: '100%', backgroundColor: '#cccccc', height: '39rem' }}>
        <div style={{ height: "10rem" }}>
        </div>
        <div className="row">
          <div style={{ width: '52%', height: '100%', marginRight: '7%', marginLeft: '5%' }}>
            <Image src={chess_image} />
          </div>
          <Card border="dark" style={{ width: "30%", height: "20%" }}>
            <div className="row h-100 justify-content-center align-items-center">
              <form onSubmit={submitHandler} className="col-10">
                <br />
                <h2 style={{ fontWeight: "bolder", textAlign: 'center' }}>로그인</h2>
                <hr />

                <Form.Group controlId="formBasicEmail">
                  <Form inline>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      style={{ width: "100%" }}
                      onChange={({ target: { value } }) => setEmail(value)}
                      placeholder="이메일을 입력하세요."
                    />
                  </Form>
                  <Form inline>
                    <Form.Label style={{ width: "100%" }}></Form.Label>
                    <Form.Text className="text-muted">
                      이메일 형식에 맞게 입력해주세요.
                      </Form.Text>
                  </Form>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form inline>
                    <Form.Control
                      type="password"
                      name="password"
                      style={{ width: "100%" }}
                      onChange={({ target: { value } }) => setPassword(value)}
                      placeholder="비밀번호를 입력하세요."
                    />
                  </Form>
                </Form.Group>

                <button type="submit" className="btn btn-dark btn-block">
                  로그인하기
                </button>

                <div className="App-wrapper" style={{ width: '100%' }}>
                  <p className="forgot-password text-center">
                    <Link to='/signup' style={{ textDecoration: 'none', color: 'black' }}>
                      회원가입
                    </Link>
                    <a>
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Init;