


// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./db');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const helmet = require('helmet');
app.use(helmet());
const cors = require('cors');
app.use(cors()); // 모든 도메인에서의 요청을 허용



app.use(express.static('public')); // 정적 파일 제공 폴더 설정

io.on('connection', (socket) => {
    console.log('New client connected');

    // 클래스 출발 시간 설정
    socket.on('startMeal', async (classId) => {
        const currentTime = new Date().toLocaleTimeString();
        try {
            const conn = await db.getConnection();
            const query = `INSERT INTO times (class_id, time) VALUES (?, ?) ON DUPLICATE KEY UPDATE time = VALUES(time)`;
            await conn.query(query, [classId, currentTime]);
            io.emit('timeUpdated', { classId, currentTime });
            conn.release(); // 연결 반환
        } catch (err) {
            console.log(err.message);
        }
    });

    // 클래스 출발 시간 취소
    socket.on('cancelMeal', async (classId) => {
        try {
            const conn = await db.getConnection();
            const query = `DELETE FROM times WHERE class_id = ?`;
            await conn.query(query, [classId]);
            io.emit('timeUpdated', { classId, currentTime: "" });
            conn.release(); // 연결 반환
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
