const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./db');
const cors = require('cors');
const { format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors()); // 모든 도메인에서의 요청을 허용
app.use(express.static('public')); // 정적 파일 제공 폴더 설정

io.on('connection', (socket) => {
    console.log('New client connected');

    // 클래스 출발 시간 설정
    socket.on('startMeal', (classId) => {
        const now = new Date();
        const timeZone = 'Asia/Seoul';
        const zonedTime = utcToZonedTime(now, timeZone);
        const currentTime = format(zonedTime, 'HH:mm:ss', { timeZone });
        
        db.getConnection((err, connection) => {
            if (err) {
                return console.error('Database connection failed: ', err);
            }
            connection.query('INSERT INTO times (class_id, time) VALUES (?, ?) ON DUPLICATE KEY UPDATE time = ?', [classId, currentTime, currentTime], (err, results) => {
                connection.release();
                if (err) {
                    return console.error(err.message);
                }
                io.emit('timeUpdated', { classId, currentTime });
            });
        });
    });

    // 클래스 출발 시간 취소
    socket.on('cancelMeal', (classId) => {
        db.getConnection((err, connection) => {
            if (err) {
                return console.error('Database connection failed: ', err);
            }
            connection.query('DELETE FROM times WHERE class_id = ?', [classId], (err, results) => {
                connection.release();
                if (err) {
                    return console.error(err.message);
                }
                io.emit('timeUpdated', { classId, currentTime: "" });
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
