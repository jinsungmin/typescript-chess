import React, { useEffect, useState } from 'react';

import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import axios from "axios";

import { useHistory, Link } from "react-router-dom";
import { set } from "js-cookie";

const Signup= () => {
 const [email, setEmail] = useState("");
 const [username, setUserName] = useState("");
 const [password, setPassword] = useState("");
 const [password_again, setPasswordAgain] = useState("");

 const [password_error, setPasswordError] = useState<any>();
 const [password_match, setPasswordMatch] = useState<any>();

 const Email = (e:any) => {
  setEmail(e.target.value);
}; 

const UserName = (e:any) => {
  setUserName(e.target.value);
};
const Password = (e:any) => {
  setPassword(e.target.value);
};
const PasswordAgain = (e:any) => {
  setPasswordError(e.target.value !== password);
  setPasswordMatch(e.target.value === password);
  setPasswordAgain(e.target.value);
};

const submitHandler  = (e:any) => {
  e.preventDefault();

 const signupinfo = {
   email: email,
   username: username,
   password: password,
 };
if(password === password_again){
 axios
      .post(`/api/auth/register`, signupinfo)
      .then((res: any) => {
        console.log(res.data);
        alert(res.data.message);
        setEmail("");
        setUserName("");
        setPassword("");
        setPasswordAgain("");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
    }else if(password !== password_again)
    alert("비밀번호가 일치하지 않습니다.");
};
  return (
    <div style={{ height: "34rem" }}>
  <div 
    style={{
      backgroundColor: "#f7feff",
    }}
  >
    <div style={{ height: "4rem" }}> </div>
    <div style={{ height: "30rem" }}>
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <Card border="info" style={{ width: "50rem", height: "30rem" }}>
            <div className="row h-100 justify-content-center align-items-center">
              <form onSubmit={submitHandler} className="col-10">
                <br/>
                <br/>
                <h2 style={{ fontWeight: "bolder" }}>회원가입</h2>
                <hr />
                <Form.Group>
                  <Form inline>
                  <Form.Label style={{ width: "8rem" }}>*이메일 주소</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    style={{ width: "20rem" }}
                    onChange={Email}
                    placeholder="이메일을 입력하세요."
                  /> </Form>
                </Form.Group>
               
                <Form.Group>
                  <Form inline>
                  <Form.Label style={{ width: "8rem" }}>*사용자명</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    style={{ width: "20rem" }}
                    onChange={UserName}
                    placeholder="사용자명을 입력하세요."
                  /></Form>
                </Form.Group>

                <Form.Group>
                  <Form inline>
                  <Form.Label style={{ width: "8rem" }} >*비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    style={{ width: "20rem" }}
                    onChange={Password}
                    placeholder="비밀번호를 입력하세요."
                  /></Form>
                </Form.Group>

                <Form.Group>
                <Form inline>
                  <Form.Label style={{ width: "8rem" }}>*비밀번호 확인</Form.Label>
                  <Form.Control
                    type="password"
                    name="password_again"
                    value={password_again}
                    style={{ width: "20rem" }}
                    onChange={PasswordAgain}
                    placeholder="비밀번호를 다시 한번 입력하세요."
                  /></Form>
                   <Form.Text className="text-muted">
                    <Form.Label style={{ width: "10rem" }}></Form.Label>
                    {password_error && "비밀번호가 일치하지 않습니다"}
                    {password_match && "비밀번호가 일치합니다"}
                    </Form.Text>
                </Form.Group>
        
                <Form.Text  className="text-muted" >
                  *은 필수항목입니다.
                </Form.Text>
                
                <button
                  type="submit"
									className="btn btn-info btn-block"
									style={{width:'50%', left: "0",
                  right: "0",
                  marginLeft: "auto",
                  marginRight: "auto",}}
                  onClick={submitHandler}
                >
                  회원가입
                </button>
                
                <p className="forgot-password text-center">
                  <Link href="login" to='/' style={{ textDecoration: 'none', color:'black' }}>
                    이미 회원이신가요? 로그인
                  </Link>
                </p>
                <br />
                <br />
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};
export default Signup;