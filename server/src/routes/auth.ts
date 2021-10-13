import { UserModel } from '../user';

var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sanitizeHtml = require("sanitize-html");
const { isJustLoggedIn, isNotLoggedIn, getLoggedInUserId, generateRefreshToken } = require("./middlewares");
require("dotenv").config();

router.post("/register", isNotLoggedIn, async (req, res, next) => {
  let { email, username, password } = req.body;

  try {
    // 양식 데이터 sanitize
    email = sanitizeHtml(email);
    username = sanitizeHtml(username);
    password = sanitizeHtml(password);
    
    // 내용이 비어있는 경우, 요청 거부
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: "formFieldsEmpty",
        message: "양식 (이메일, 비밀번호, 닉네임)이 비어있어 가입에 실패했습니다",
      });
    }

    // 동일한 이메일로 가입한 사용자가 있는지 확인
    let existingUser = await UserModel.findOne({ 'email': email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "userExistsWithEmail",
        message: "이미 동일한 이메일로 가입한 사용자가 존재합니다",
      });
    }

    existingUser = await UserModel.findOne({ 'username': username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "userExistsWithUsername",
        message: "이미 동일한 닉네임으로 가입한 사용자가 존재합니다",
      });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = new UserModel({ email: email, username: username, password: hash, win: 0, lose: 0 });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "가입에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "registerFails",
      message: "가입에 실패했습니다",
    });
  }
});

// 로그인
// 토큰을 생성하고 사용자에게 반환한다 (httpOnly cookies)
router.post("/login", isNotLoggedIn, async (req, res, next) => {
  const { email, password } = req.body;
  // 이메일로 사용자 조회
  try {
    const user = await UserModel.findOne({ 'email': email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "userNotExists",
        message: "해당하는 회원이 존재하지 않습니다",
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // 비밀번호가 일치할 경우, JWT payload 생성
      const payload = {
        uid: user.id,
      };

      // JWT 토큰 생성
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_expiration") });

      // 새로운 refresh 토큰과 해당 expiration 생성
      let refresh_token = generateRefreshToken(req, user.id);
      let refresh_token_maxage = new Date();
      refresh_token_maxage.setSeconds(refresh_token_maxage.getSeconds() + req.app.get("jwt_refresh_expiration"));

      // 브라우저 httpOnly 쿠키 설정
      res.cookie("access_token", token, {
        // secure: true,
        httpOnly: false,
      });
      res.cookie("refresh_token", refresh_token, {
        // secure: true,
        httpOnly: true,
      });

      // 해당 계정 id를 key로 하여 Redis 서버에 저장
      req.client.set(
        user.id,
        JSON.stringify({
          refresh_token: refresh_token,
          expires: refresh_token_maxage,
        }),
        req.client.print
      );

      let ret_json = {
        success: true,
        uid: user.id,
        message: "로그인 성공",
        user: user
      };

      return res.json(ret_json);
    } else {
      return res.status(401).json({
        success: false,
        error: "authFails",
        message: "패스워드가 일치하지 않습니다",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      error: "loginFails",
      message: "로그인 오류",
    });
  }
});

// 로그아웃 - req.body의 id를 이용해 로그아웃
router.post("/logout", isJustLoggedIn, async (req, res, next) => {
  try {
    // 로그인 검증
    const user_id = await getLoggedInUserId(req, res); // 현재 로그인한 사용자 ID

    // 사용자 refresh 토큰을 Redis로부터 삭제
    req.client.del(user_id, (err, response) => {
      if (response == 1) {
        console.log("Redis로부터 사용자 refresh 토큰 삭제 성공");
        // 브라우저로부터 httpOnly 쿠키도 삭제
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.status(200).json({
          success: true,
          message: "로그아웃 성공",
        });
      } else {
        console.log("Redis로부터 사용자 refresh 토큰 삭제 실패");
        res.status(400).json({
          success: false,
          error: "tokenDeletionFails",
          message: "로그아웃 실패",
        });
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "userNotLoggedIn",
      message: "로그인 되어 있지 않습니다",
    });
  }
});

router.post("/profile", (req, res, next) => {
  // 쿠키가 존재하고 유효한지 확인한다
  // JWT payload를 이용해 사용자 id를 확인한다
  // ./middlewares -> isLoggedIn과 동일
});

module.exports = router;