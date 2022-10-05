// const { text } = require("express");
//8_17_2
var socket;//= null;
let video;
let poseNet;
let pose;
let cha = 1;//药剂高度
let dan = 0;//子弹高度
let needleState = 0;//0：针管空的；1：针管满的，防止游戏开始直接发射子弹
let virusR = 0;//病毒大小
let ran ;
let x;//药剂底部与判定线的距离
let bulState = 0;//子弹存在的状态
let gameState = 0;//游戏运行状态
let scores = 0;
let pic = 120;//病毒最后的大小
let clients0 = 0;
let count = 0;//病毒被击中的次数
let xueLiang;//病毒血量
let cal;//判定成功一次减少的血量




function preload(){
	evilVirus = loadImage('img/evilVirus.png');
	needle = loadImage('img/needle.png');
	boom = loadImage('img/boom.png');
  }

function setup() {
	// socket = io.connect('https://multi-hit-virus-7gjqnt40c3aaa635-1309180325.ap-shanghai.app.tcloudbase.com/');
	// socket = io.connect('https://multi-hit-virus.herokuapp.com/');
	socket = io.connect('https://multi-hit-virus-2.herokuapp.com/');
	// socket = io.connect('http://127.0.0.1:3000');
	// socket = io.connect('http://192.168.8.160:3000');
	// socket = io.connect('http://5386w319o8.qicp.vip/');


	//画布大小跟随窗口
	createCanvas(windowHeight*1.78, windowHeight);
	gravity = createVector(0, 0.2);
	noStroke();
	strokeWeight(4);

	//准备camera
	video = createCapture(VIDEO);
	video.size(windowHeight*1.78, windowHeight);
	video.hide();
	// createCanvas(640, 480);

	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on('pose', gotPoses);
	rectMode(CORNERS);// rect() 的前两个参数解读成形状其中一个角落的位置，而第三和第四个参数则被解读成对面角落的位置
	ran = random(height/1.5, height/1.3);//判定线的位置
	x = height/1.68 + cha - ran;//计算药剂底部与判定线的距离
	var data = {
		gameStateTemp : gameState,
		chaTemp : cha,
		danTemp : dan,
		needleStateTemp : needleState,
		virusRtemp : virusR,
		ranTemp : ran,
		xTemp : x,
		bulStateTemp : bulState,
		scoresTemp : scores
	}

	socket.on('game', function(data){//接收游戏状态
		gameState = data.gameStateTemp;
		// console.log(gameState);
	});

	socket.on('keys', function(data){
		// console.log('start');
		gameState = 1;//data.gameStateTemp;
	  	cha = data.chaTemp;
		dan = data.danTemp;
		needleState = data.needleStateTemp;
		virusR = 0;
		ran = random(height/1.5, height/1.3);//判定线的位置
		x = height/1.68 + cha - ran;
		bulState = data.bulStateTemp;
		scores = data.scoresTemp;
	});

	count = 0;

}

function gotPoses(poses){
	if(poses.length > 0){
	  pose = poses[0].pose;
	}
  }
  
function modelLoaded(){
	console.log('poseNet ready');
}

function keyPressed(){
	if(key == 's'){  //按下s游戏开始
		gameState = 1;
	  	cha = 1;//药剂高度
		dan = 0;//子弹高度
		needleState = 0;//0：针管空的；1：针管满的，防止游戏开始直接发射子弹
		virusR = 0;//病毒大小
		ran = random(height/1.5, height/1.3);//判定线的位置
		x = height/1.68 + cha - ran;//计算药剂底部与判定线的距离
		bulState = 0;//子弹存在的状态
		scores = 0;
		xueLiang = width/1.5 - width/3;//病毒血量长度
		cal = xueLiang/(6*clients0);//判定成功一次减少的单位血量数
		count = 0;//病毒被打倒的次数归零
		data = {
			gameStateTemp : gameState,
			chaTemp : cha,
			danTemp : dan,
			needleStateTemp : needleState,
			virusRtemp : virusR,
			ranTemp : ran,
			xTemp : x,
			bulStateTemp : bulState,
			scoresTemp : scores
	
		}
		socket.emit('game', data);//传输游戏状态到服务器端
		socket.emit('keys', data);
	  }
}
	

function draw(){//buduanxunhuanzhixing

	socket.emit('clients', clients0);
	socket.on('clients', function(clients){
		clients0 = clients;
	})

	translate(video.width, 0);//视频左右翻转
	scale(-1, 1);
	background(0, 0, 0);
  	image(video, 0, 0, width, width * video.height / video.width);
	translate(video.width, 0);//视频左右翻转
	scale(-1, 1);
	data = {
		gameStateTemp : gameState,
		chaTemp : cha,
		danTemp : dan,
		needleStateTemp : needleState,
		virusRtemp : virusR,
		ranTemp : ran,
		xTemp : x,
		bulStateTemp : bulState,
		scoresTemp : scores
	}
	 
	socket.on('virus', function(data){//改变子弹状态和病毒大小
		virusR = data.virusRtemp;

	});


	fill('#03A9F4');
	noStroke();

	if(pose){
		let d = dist(pose.leftElbow.x, pose.leftElbow.y, pose.rightElbow.x, pose.rightElbow.y);//计算左右手肘的距离
		if(d>width*0.5){
			bulState = 0;
			x = height/1.68 + cha - ran;
			//console.log(x);
			if( x < 40 & x > -40){
				bulState = 1;
			}
			dan = 0;
			
			if(cha<height/3.8){
				cha+=1;
				needleState = 1;
			}else{
				cha = height/3.8;
				needleState = 1;//针管满了
			}
		}

		if(d<width*0.4){
			if(cha>0){
				cha = 0;
				needleState == 0;//针管空了
			}else{
				cha = 0;
				needleState == 0;//针管空了
			}

			if(cha == 0 & needleState == 1 & bulState == 1){
					dan += 2;
					if(gameState){
						ellipse(width/2, 305-dan, 10);//画子弹
					}
			}
			
		}

		let d1 = dist(width/3+89, 305-dan, width/3+100, 180-virusR);//计算子弹和病毒的距离
		if(d1 < 30 & needleState == 1){
			ran = random(height/1.5, height/1.3);
			needleState = 0;
			scores++;
			virusR += 10;//放到服务端上
			socket.emit('virus', data);
			// count++;
			socket.emit('count',count);

		}
		socket.on('count',function(countTemp){
			count=countTemp;
		});
		// console.log('count:',count)

		if(width/1.5 - count*cal - width/3 > 10){//根据血量判定游戏结束
			image(evilVirus, width/2.35, 20, width/6.5, width/6.5-virusR);//显示正上方的病毒
			
		}else{
			image(boom, width/2.35, 0, 200, 200-virusR);//显示爆炸效果
			gameState = 0;
			data.gameStateTemp = gameState;
			socket.emit('game', data);//传输游戏状态到服务器端
		}
		
		if(gameState){
			rect(width/1.935, height/1.68, width/2.08, height/1.68+cha);//画注射剂药剂,cha = 87则满
		}
		

	}

	strokeWeight(1);
	stroke(51);
	fill(0, 0, 0, 0);
	rect(width/3, 20, width/1.5, 40);//血条框
	fill('red');
	xueLiang = width/1.5 - width/3;//病毒血量长度
	cal = xueLiang/(6*clients0);//判定成功一次减少的单位血量数
	// console.log(zuoyouCha);
	rect(width/3, 20, width/1.5 - count*cal, 40);//病毒血条表示

	if(gameState){
		strokeWeight(1);
		stroke(51);
		textSize(30);
		fill('#03A9F4');
		text('scores: '+scores, 30, 40);
		text('clients: '+clients0, 30, 80);
		image(needle, width/2.5, height/2, width/5, height/2.2);//显示正下方的注射器
		noStroke();
		fill('red');
		rect(width/1.935, ran, width/2.08, ran+3);//判定线
	}

}
