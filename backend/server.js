const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/users', require('./routes/users'));

// Socket.io 连接处理
io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);

    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

// 将 io 实例导出，供路由使用
module.exports = { app, io };