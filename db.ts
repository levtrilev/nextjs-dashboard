import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 5432, // порт PostgreSQL по умолчанию
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 300000, // время ожидания перед закрытием неактивного соединения
});




export default pool;