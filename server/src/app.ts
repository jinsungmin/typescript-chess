import * as express from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import { requestLoggerMiddleware } from './request.logger.middleware';

const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const redis = require("./redis_instance");
const client = redis.getConnection();

require("dotenv").config();

// routers
const apiRouter = require("./routes/api");

const app = express();
app.use(cors());

// TODO - add middleware
app.use(requestLoggerMiddleware);

// express variables
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// JWT variables
app.set("jwt_expiration", 60 * 10);
app.set("jwt_refresh_expiration", 60 * 60 * 24 * 30);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Redis 미들웨어 - req.client로 클라이언트를 가져올 수 있음
app.use((req: any, res, next) => {
	req.client = client;
	next();
});

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

// routers
app.use("/api", apiRouter);

/*
// router
try {
    const swaggerDocument = require('../swagger.json');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    console.error('Unable to read swagger.json', err);
}

RegisterRoutes(app);
*/
export { app };