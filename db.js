// db.js
const mariadb = require('mysql');

// 데이터베이스 연결
const connection = mariadb.createConnection({
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
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS times (
        class_id VARCHAR(255) PRIMARY KEY,
        time VARCHAR(255) NOT NULL
    )
`;

connection.query(createTableQuery, (err, results, fields) => {
    if (err) {
        console.error('Could not create table', err);
    } else {
        console.log('Table created or already exists');
    }
});

module.exports = connection;
