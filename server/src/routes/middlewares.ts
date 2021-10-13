import { UserModel } from '../user';

const jwt = require("jsonwebtoken");
require("dotenv").config();

// 사용자가 정지 상태인지, 이메일 인증은 받았는지 여부는 검사하지 않고 로그인 되어 있는지 검사
const isJustLoggedIn = async function (req, res, next) {
	try {
		const user = await getLoggedInUserInfo(req, res);

		// 로그인 되어있지 않은 경우
		if (!user) {
			return res.status(401).json({
				success: false,
				error: "userNotLoggedIn",
				message: "로그인 되어 있지 않습니다",
			});
		}
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).json({
			success: false,
			error: error,
			message: "로그인 되어 있지 않습니다",
		});
	}
};

// 접속한 사용자의 정보를 불러오는 함수 - 사용하려는 라우트에서 isLoggedIn이 미들웨어로 반드시 존재해야 함
// 인증에 오류가 있을시 null 반환
const getLoggedInUserInfo = async function (req, res) {
	try {
		await validateJwt(req, res);

		// 사용자 브라우저 토큰을 가져와 접속한 사용자 id를 읽음
		let accesstoken = req.cookies.access_token || null;
		const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;
		const user = await UserModel.findOne({
			_id: decoded_uid
		})

		return user;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const isNotLoggedIn = async function (req, res, next) {
	try {
		const result = await validateJwt(req, res);

		if (!result) {
			next();
		} else {
			return res.status(401).json({
				success: false,
				error: "userAlreadyLoggedIn",
				message: "로그인이 이미 되어있습니다",
			});
		}
	} catch (error) {
		next();
	}
};

// 접속한 사용자의 id를 불러오는 함수 - 사용하려는 라우트에서 isLoggedIn이 미들웨어로 반드시 존재해야 함
// 인증에 오류가 있을시 null 반환
const getLoggedInUserId = async function (req, res) {
  try {
    await validateJwt(req, res);

    // 사용자 브라우저 토큰을 가져와 접속한 사용자 id를 읽음
    let accesstoken = req.cookies.access_token || null;
    const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;
    const user = await UserModel.findOne({
			_id: decoded_uid
		})
    return user.id;
  } catch (error) {
    return null;
  }
};


// JWT 토큰 유효 검증 함수
const validateJwt = function (req, res) {
  return new Promise((resolve, reject) => {
    let accesstoken = req.cookies.access_token || null;
    let refreshtoken = req.cookies.refresh_token || null;

    // 쿠키에서 두 토큰이 둘 다 존재하는지 확인
    if (accesstoken && refreshtoken) {
      // access 토큰 검증
      jwt.verify(accesstoken, process.env.JWT_SECRET, async (err, decoded) => {
        try {
          if (err) {
            // access 토큰의 expiration 기한이 지나 유효하지 않은 경우,
            // refresh 토큰을 이용해 새 access 토큰 갱신
            if (err.name === "TokenExpiredError") {
              console.log("토큰 만료 기간 지남 (TokenExpiredError)");
              // Redis가 expire 됐다는 것은 Redis에 최소 한 번은 들어갔단 뜻이므로,
              // Redis에서 토큰을 찾을 수 있는지 확인
              const decoded_uid = jwt.decode(accesstoken, process.env.JWT_SECRET).uid;

              await req.client.get(decoded_uid, function (err, val) {
                let redis_token = err ? null : val ? JSON.parse(val) : null;

                // Redis에 토큰이 존재하지 않는다면,
                // 또는 브라우저가 Redis에 존재하지 않는 또다른 refresh 토큰을 보냈다면,
                if (!redis_token || redis_token.refresh_token !== refreshtoken) {
                  // hacking 시도 감지
                  // 해당 사용자에 대해서, 해당 값을 가진 refresh 토큰이 없거나
                  // 또는 refresh token이 request로부터 온 것과 storage로부터 온 것이 다르다는 것을 의미

                  // 브라우저로부터 httpOnly 쿠키도 삭제
                  res.clearCookie("access_token");
                  res.clearCookie("refresh_token");

                  reject("refreshTokenDiffersFromServer");
                } else {
                  // refresh 토큰이 expire된 경우
                  // access 토큰과 refresh token 둘다 새로 갱신
                  if (new Date(redis_token.expires) < new Date()) {
                    console.log("Refresh 토큰 만료 기간 지남 - 새로 갱신");

                    // refresh 토큰이 expire 됐으므로 갱신
                    let refresh_token = generateRefreshToken(req, decoded_uid);

                    // 해당 refesh token을 response 객체를 이용해 httpOnly 쿠키에 저장
                    // localhost면 secure option을 끄고 HTTPS라면 켤 것
                    res.cookie("refresh_token", refresh_token, {
                      // secure: true,
                      httpOnly: true,
                    });

                    // refresh 토큰의 expiration 기한을 JWT refresh expiration 기간만큼 초기화/업데이트 (refresh)
                    console.log("Refresh 토큰 재발급");
                    let refresh_token_maxage = new Date();
                    refresh_token_maxage.setSeconds(
                      refresh_token_maxage.getSeconds() + req.app.get("jwt_refresh_expiration")
                    );

                    // Redis에 저장
                    req.client.set(
                      decoded_uid,
                      JSON.stringify({
                        refresh_token: refresh_token,
                        expires: refresh_token_maxage,
                      }),
                      req.client.print
                    );
                  }

                  // access token 발행
                  // 사용자 ID를 JWT payload에 저장함을 유념할 것
                  console.log("Access 토큰 발급");
                  const payload = { uid: decoded_uid };
                  let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_expiration") });
                  // 다시 한 번 토큰을 httpOnly 쿠키에 저장
                  res.cookie("access_token", token, {
                    // secure: true,
                    httpOnly: false,
                  });
                  // 나중에 다시 쓸 수 있게 modified request, response 객체 반환
                  resolve({ res: res, req: req });
                }
              });
            } else {
              // "TokenExpiredError"가 아닌 다른 에러 발생
              // (토큰이 유효하지 않거나 이상한 포맷으로 작성되는 등)
              console.log("Access 토큰 인증 실패 (기타 예외)");
              reject(err);
            }
          } else {
            // 인증 성공
            // (access 토큰이 유효하고 토큰 기한도 만료되지 않음)
            console.log("Access 토큰 인증 성공");
            resolve({ res: res, req: req });
          }
        } catch (error) {
          console.log("Access 토큰 인증 실패");
          console.error(error);
          reject("tokenValidationFails");
        }
      });
    } else {
      // 토큰이 없는데 로그인하려고 할 경우
      console.log("Access 토큰 또는 Refresh 토큰이 존재하지 않음");
      reject("tokenNotExists");
    }
  });
};

// A little helper function for generation of refresh tokens
const generateRefreshToken = function (req, uid) {

	const refresh_token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: req.app.get("jwt_refresh_expiration") });
	return refresh_token;
};

const reflectGameResult = async (username, game_result) => {
  try {
    const user = await UserModel.findOne({ 'username': username });

    console.log('test:', user);
    
    if(game_result) {
      await user.updateOne({win: user.win +1}, {'username': username }).exec();
    } else {
      await user.updateOne({lose: user.lose +1}, {'username': username }).exec();
    }
    
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
	isJustLoggedIn,
	isNotLoggedIn,
	validateJwt,
	generateRefreshToken,
	getLoggedInUserInfo,
  getLoggedInUserId,
  reflectGameResult,
};