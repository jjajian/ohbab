


// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./db');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const cors = require('cors');
app.use(cors()); // 모든 도메인에서의 요청을 허용



app.use(express.static('public')); // 정적 파일 제공 폴더 설정

io.on('connection', (socket) => {
    console.log('New client connected');

    // 클래스 출발 시간 설정
    socket.on('startMeal', (classId) => {
        const currentTime = new Date().toLocaleTimeString();
        // getConnection을 사용하여 데이터베이스 연결을 가져옵니다.
        db.getConnection((err, connection) => {
            if (err) {
                // 연결 중 오류가 발생한 경우
                return console.error('Database connection failed: ', err);
            }
            // SQL 쿼리 실행
            connection.query('INSERT INTO times (class_id, time) VALUES (?, ?) ON DUPLICATE KEY UPDATE time = ?', [classId, currentTime, currentTime], (err, results) => {
                connection.release(); // 사용 완료된 연결을 pool로 반환합니다.
                if (err) {
                    return console.error(err.message);
                }
                // 모든 클라이언트에게 시간 업데이트 이벤트를 방송합니다.
                io.emit('timeUpdated', { classId, currentTime });
            });
        });
    });
    

    // 클래스 출발 시간 취소
    socket.on('cancelMeal', async (classId) => {
        try {
            // 데이터베이스 연결을 가져옵니다.
            const conn = await db.getConnection();
            
            const query = `DELETE FROM times WHERE class_id = ?`;
            
            // 쿼리를 실행합니다.
            await conn.query(query, [classId]);
            
            // 모든 클라이언트에게 시간 업데이트 이벤트를 방송합니다.
            io.emit('timeUpdated', { classId, currentTime: "" });
            
            // 연결 반환
            conn.release();
        } catch (err) {
            console.log(err.message);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
