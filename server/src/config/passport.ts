const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
import { UserModel } from '../user';

require("dotenv").config();

let opts = {jwtFromRequest: '', secretOrKey: '', issuer: '' };

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // 클라이언트에서 서버로 JWT 전달 (Bearer)
opts.secretOrKey = process.env.JWT_SECRET;
opts.issuer = "chess.com";

const verifyUser = async (jwt_payload, done) => {
  console.log("payload");
  try {
    const user = await UserModel.findOne({ _id: jwt_payload.id });
    //const user = await User.findOne({ where: { id: jwt_payload.id, deleted_at: { $eq: null } } });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
};

module.exports = (passport) => {
  passport.use(new JwtStrategy(opts, verifyUser));
};