export default Object.freeze({
  PORT: 2999,
  BASE_URL: "http://localhost:2999", // cookie.iss
  allowedOrigins: ["http://localhost:3000", "http://localhost:5173"],
  PWD_SALT: "88888888",
  COOKIE: {
    DOMAIN: {
      user: "localhost",
      admin: "localhost",
    },
    SECRET: "a1b2c3d4e5f60708090a0b0c0d0e0f",
    SECURE: {
      user: false,
      admin: false,
    },
    EXPIRES: {
      user: 1000 * 60 * 60 * 24 * 30 * 12 * 10, // 10 years
      admin: 1000 * 60 * 30, // 30 minutes
    },
  },
  DB: {
    url: "mongodb://localhost:27017",
    options: {
      maxPoolSize: 10,
      minPoolSize: 4,
    },
    paginationSize: {
      bookList: 10,
      notice: 5,
      bill: 10,
    },
    dbName: "rebook",
    collectionName: {
      user: "user",
      admin: "admin",
      book: "book",
      notice: "notice",
      bill: "bill",
      chat: "chat",
    },
  },
});
