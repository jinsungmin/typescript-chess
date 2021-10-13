const redis = require("redis");
require("dotenv").config();

class Redis {
  /*
  public readonly host!: any;
  public readonly port!: any;
  public readonly connected!: any;
  public client!: any;
  */
  constructor() {
    this.host = process.env.REDIS_HOST;
    this.port = process.env.REDIS_PORT;
    this.connected = false;
    this.client = null;
  }

  // Redis client를 반환
  getConnection() {
    if (this.connected) {
      return this.client;
    } else {
      console.log("새 Redis 인스턴스 생성");
      this.client = redis.createClient({
        host: this.host,
        port: this.port,
      });
      return this.client;
    }
  }
}

module.exports = new Redis();