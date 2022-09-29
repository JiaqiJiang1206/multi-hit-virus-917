const express = require("express");
const app = express();

const cors = require('cors');

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

var PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log("My socket server is running");
})

const io = require('socket.io')(server);

app.use(express.static('public'));

let clients = 0;
io.sockets.emit('serverMsg', clients);

io.sockets.on('connect',     //新建一个客户端则被调用三次（为什么是三次？（理应是一次吧
    // We are given a websocket object in our function

    function (socket) {

        clients ++;
        console.log("clients connect: " + Math.ceil(clients));
        
        socket.on('disconnect', function () {
          clients --;
          console.log("clients disconnect: ", Math.floor(clients));

      });
    socket.on('clients', function(clients0){

        io.sockets.emit('clients', clients);
    })



      socket.on('game', function (data){
        io.sockets.emit('game', data);//向所有客户端传输游戏数据
      })
    
      socket.on('keys', function (data){
        data.chaTemp = 1;
        data.danTemp = 0;
        data.needleStateTemp = 0;
        data.gameStateTemp = 1;
        data.bulStateTemp = 0;
        data.scoresTemp = 0;
        io.sockets.emit('keys', data);//向其他所有客户端传输游戏数据
        // console.log(gameState);
      })
    
      socket.on('virus', function(data){
        data.virusRtemp+=5;

        io.sockets.emit('virus', data);//向所有客户端传输游戏数据
      })
      
    }
);
