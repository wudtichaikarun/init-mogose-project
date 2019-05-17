import 'dotenv/config';

export default {
  env: process.env.NODE_ENV || 'localhost',
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  port: process.env.PORT || 3000
};
