import { Pool } from 'pg';

const pool = new Pool({
  // host: process.env.DB_HOST,
  // host: process.env.DB_HOST_127,
  host: process.env.DB_HOST_MYSITE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 5432, // порт PostgreSQL по умолчанию
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 300000, // время ожидания перед закрытием неактивного соединения
});

//   sslmode: require,


export default pool;