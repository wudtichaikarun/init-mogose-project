import 'dotenv/config';

export default {
  env: process.env.NODE_ENV || 'localhost',
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  port: process.env.PORT || 3000,
  conductorURL: {
    // staging: 'https://api.staging.drivs.io/conductor/api',
    staging: 'http://localhost:8080/api',
    local: 'http://localhost:8080/api'
  }
};
