# Backend server of a chess application made with Node.js

## 서버 셋업

### MongoDB 설치

- 링크 참고: https://javacpro.tistory.com/64

### Redis 설치 (로그인/로그아웃 구현)

- 윈도우는 비공식 지원
- GitHub 저장소에서 release (stable) 중 .msi 파일 다운로드 받으면 됨
- 링크 참고: https://gofnrk.tistory.com/35?category=768900

### 프로젝트 모듈 설치

- 명령창에서 실행

```sh
npm install
```

### .env 파일 생성

- 프로젝트 루트 경로 (app.js 옆에)에 `.env` 파일을 만들고 내용물로 다음과 같이 한다.

```
COOKIE_SECRET=chessdevsecret
JWT_SECRET=chesstokensecret
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 서버 시작

```sh
npm start
```
