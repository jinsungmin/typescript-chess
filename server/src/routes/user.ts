import { UserModel } from '../user';

var express = require("express");
var router = express.Router();

const bcrypt = require("bcryptjs");
const sanitizeHtml = require("sanitize-html");
const { isJustLoggedIn, getLoggedInUserId, getLoggedInUserInfo } = require("./middlewares");

// 사용자 정보 조회
router.get("/:username", isJustLoggedIn, async (req, res, next) => {
  const { username } = req.params; // 조회할 사용자 이름
  try {
    // 조회할 사용자 정보 조회
    const user = await UserModel.findOne({ 'username': username });

    // 조회할 사용자가 DB에 존재하지 않은 경우
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "entryNotExists",
        message: "해당 닉네임을 가진 사용자가 존재하지 않습니다",
      });
    }

    return res.json({
      success: true,
      message: "사용자 정보 조회에 성공했습니다",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "요청 오류",
    });
  }
});

// 로그인한 사용자 정보 조회
router.get("/", isJustLoggedIn, async (req, res, next) => {
  try {
    // 로그인한 사용자 ID
    const user_id = await getLoggedInUserId(req, res);

    // 조회할 사용자 정보 조회
    const user = await UserModel.findOne({ _id: user_id });

    return res.json({
      success: true,
      message: "로그인한 사용자 정보 조회에 성공했습니다",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "요청 오류",
    });
  }
});

// 로그인한 사용자 정보를 일부 변경
router.patch("/", isJustLoggedIn, async (req, res, next) => {
  let { username, game_result } = req.body;

  try {
    
    username = sanitizeHtml(username);
    const user = await UserModel.findOne({ 'username': username });
    
    if(game_result) {
      await UserModel.updateOne({win: user.win +1}, {'username': username }).save();
    } else {
      await UserModel.updateOne({lose: user.lose +1}, {'username': username }).save();
    }

    return res.status(200).json({
      success: true,
      message: "사용자 정보 수정에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "사용자 정보 수정에 실패했습니다",
    });
  }
});

// 로그인한 사용자 탈퇴 (비밀번호 일치할 경우만 성공)
router.delete("/", isJustLoggedIn, async (req, res, next) => {
  try {
    // 로그인 검증
    const user_id = await getLoggedInUserId(req, res);

    // 사용자 삭제
    await UserModel.deleteOne({ _id: user_id });
    return res.json({
      success: true,
      message: "사용자 탈퇴에 성공했습니다",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: "requestFails",
      message: "사용자 탈퇴에 실패했습니다",
    });
  }
});

module.exports = router;