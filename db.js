// db.js
const mariadb = require('mysql');

// 데이터베이스 연결
const pool = mariadb.createPool({
    host: 'mariadb',   // MySQL 서버 호스트
    port: 3306,
    user: 'root',
    password: '0219', // MySQL 비밀번호
    database: 'database' // 사용할 데이터베이스 이름
});

connection.connect((err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// 테이블 생성
(async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS times (
            class_id VARCHAR(255) PRIMARY KEY,
            time VARCHAR(255) NOT NULL
        )
    `;

    try {
        const connection = await pool.getConnection();
        await connection.query(createTableQuery);
        console.log('Table created or already exists');
        connection.release(); // 연결 반환
    } catch (err) {
        console.error('Could not create table', err);
    }
})();

module.exports = pool;
