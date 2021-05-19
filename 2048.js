//Constant
const canvasSize = 500;
const blockSize = 100;
//大背景在css中设置
//所有格子
const BackGroundColor = '#CDC1B4';
//有数字的格子
const BackCurrentColor2= '#EEE4DA';
const BackCurrentColor4='#EDE0C8';
const BackCurrentColor8='#F2B179';
const BackCurrentColor16='#F59563';
const BackCurrentColor32='#F67C5F';
const BackCurrentColor64='#F65E3B';
const BackCurrentColor128='#EDCF72';
const BackCurrentColor256='#F3DC41';
const BackCurrentColor512='#EAC74E';
const BackCurrentColor1024='#E0B917';

const gameSize = 4;
//格子间隔 16
const paddingSize = (canvasSize - gameSize * blockSize) / 5;
const animateTime = 0.2;
const frame_pre_second = 30;
//随机数
function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));

}
randChoice = function (arr) {
    return arr[rand(0, arr.length - 1)];
}
//Model
class Game {
    constructor() {
        //data不定死，因为游戏可能会重来
        this.data = [];
        //points是总分
        this.points=0;
        this.initializeData();
        this.gameOver=false;
        this.count=0;
        this.maxScore=0;
        this.state=1;

    }
    initializeData() {
        this.data = [];
        this.points=0;
        for (let i = 0; i < gameSize; i++) {
            let temp = [];
            for (let j = 0; j < gameSize; j++) {
                temp.push(null);
            }
            this.data.push(temp);
        }
        //游戏最开始时初始化两个
        this.generateNewblock();
        this.generateNewblock();
    }

    //1.找下次随机出现的位置，产生2的随机地方
    generateNewblock() {
        //数组记录此时哪些位置没有数字，也就是可以产生2的地方
        let possiblePositions = [];

        for (let i = 0; i < gameSize; i++) {
            for (let j = 0; j < gameSize; j++) {
                if (this.data[i][j] == null) {
                    //数组的每组值都是一个坐标
                    possiblePositions.push([i, j])
                    this.count++;
                }
            }
        }


        //找出随机
        let position = randChoice(possiblePositions);
        //给这个位置赋值
        this.data[position[0]][position[1]] = 2;
    }
    isOver(){
        for (let i = 0; i < gameSize; i++) {
            for (let j = 0; j < gameSize; j++) {
                if (this.data[i][j] == null) {
                    this.gameOver=false;
                    return false;
                }
                //比较的是左右方向
                if (j<gameSize-1){
                    if (this.data[i][j]== this.data[i][j+1]){
                        this.gameOver=false;
                        return false;
                    }
                }
                //比较上下方向
                if(i<gameSize-1){
                    if (this.data[i][j]==this.data[i+1][j]){
                        this.gameOver=false;
                        return false;
                    }
                }
            }
        }
        return true;

    }
    //转换矩阵
    shiftBlock(arr, reverse = false) {
        //双指针法，head和tail都是指针
        //[2 2 null 2] ➡ [4 2 null null]
        //head表示下一个有可能改变的，它是write
        let head = 0;
        //tail 指下一个可读的，根据它的数值来决定接下来的move read操作
        let tail = 1;
        let moves = [];
        //定义一个常量，在左右移动时可以更改
        //正序时，增加量是+1;
        let incr = 1;
        //记录分数
        let points=0;
        //返方向调下头
        if (reverse == true) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }

        while (tail < arr.length && tail >= 0) {
            //往下看的东西没有，一定不影响head，不改变
            if (arr[tail] == null) {

                tail += incr;
            } else {
                if (arr[head] == null) {
                    //在这里head指针之前位置的格子都弄好了，不会改变
                    arr[head] = arr[tail];
                    //原tail清空
                    arr[tail] = null;
                    moves.push([tail, head]);
                    tail += incr;
                    //head不能移动，因为未来他还可能发生变化
                    //这里有真正的移动

                } else if (arr[head] == arr[tail]) {
                    //  一起撞到head，合并成一个格子，并且这个格子一定不会改变，读指针加一
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    //更新分数
                    points+=arr[head];
                    this.currentPoints=arr[head];
                    moves.push([tail, head]);
                    head += incr;
                    tail += incr;

                } else {
                    //head已经确定了
                    head += incr;
                    //tail一直是领先head的 eg;[4,2,null,2]
                    //在arr[head]！=arr[tail]时，head++，tail原地不动，此时head就可能追上了tail了
                    //所以要判断 head是否等于tail，追上了，tail++，需要领先head
                    if (head == tail) {
                        tail += incr;
                    }

                }
            }
        }
        //返回object
        return {
            "moves":moves,
            "points":points
        };
    }

    //方向
    advance(command) {
        let reverseFlag = false;
        let moves = [];
        //当前的得到的分数
        let currentPoints=0;
        if (command == 'right' || command == 'down') {
            reverseFlag = true;
        }
        if (command == 'left' || command == 'right') {
            for (let i = 0; i < gameSize; i++) {
                let result = this.shiftBlock(this.data[i], reverseFlag);
                //result.moves===result["moves"]
                for (let move of result.moves) {
                    // from:move[0],to:move[1]
                    moves.push([[i, move[0]], [i, move[1]]]);
                }

                this.points += result.points;
                currentPoints+=result.points;

            }
        } else if (command == 'up' || command == 'down') {
            //先把一列一列的数字拿出来，shift后再放回去
            for (let j = 0; j < gameSize; j++) {
                let temp = [];
                //竖着取出，一列一列取
                for (let i = 0; i < gameSize; i++) {
                    temp.push(this.data[i][j]);
                }

                let result = this.shiftBlock(temp, reverseFlag);
                for (let move of result.moves) {
                    moves.push([[move[0], j], [move[1], j]]);
                  //move[]是移动的位置 ，j是当前的行数
                }
                //还原再放回去
                for (let i = 0; i < gameSize; i++) {
                    this.data[i][j] = temp[i];
                }

                this.points += result.points;
                currentPoints+=result.points;
            }
        }
        //求最高分数,这里仅仅是比较了新一轮游戏中该移动的分数和原来的分数，同时会改变最高分数
        //所以还得和最高分数比较
        this.maxScore=this.points>this.maxScore ? this.points:this.maxScore;

        let c=localStorage.getItem("maxScore");
        this.maxScore=this.maxScore>c?this.maxScore:c;

        //将null转换为数字0
        localStorage.setItem("maxScore", Number(this.maxScore));

        if (moves.length != 0) {
            this.generateNewblock();
        }
        let over=false;
        if (game.isOver()){
            over=true;
        }
        return{
            "moves":moves,
            "points":this.points,
            "currentPoints":currentPoints,
            "over":over
        };

    }
}

// 测试
class Test {
    static compareArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }
    static test_shiftBlock() {
        let gameTest = new Game();
        let testCase = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[2, 2, null, 4], [4, 4, null, null]]
        ];
        let flag = false;
        for (let test of testCase) {
            for (let reverse of [true, false]) {
                //反序，正序都遍历，不需要更改数据，只改变逻辑
                //这里需要复制input result
                let input = test[0].slice();
                let result = test[1].slice();
                if (reverse == true) {
                    input.reverse();
                    result.reverse();
                }
                //函数只能调用一次
                gameTest.shiftBlock(input, reverse);

                if (!Test.compareArray(input, result)) {
                    flag = true;
                    console.log(reverse);
                    console.log('err');
                }
            }
        }
        if (!flag) {
            console.log('pass');
        } else {
            console.log('err');
        }

    }
}
//View
class View {
    constructor(container, game) {
        this.game = game;
        this.container = container;
        this.blocks = [];
        this.initializeContainer();
    }
    initializeContainer() {

    }
    //获取坐标定位
    getGirdPosition(i, j) {
        //画图理解
        let top = (paddingSize + blockSize) * i + paddingSize;
        let left = (paddingSize + blockSize) * j + paddingSize;
        return [top, left];

    }

    doFrame(moves, curTime, totalTime) {
        if (curTime < totalTime) {
            setTimeout(() => {
                this.doFrame(moves, curTime + 1 / frame_pre_second, totalTime)
            }, 1 / frame_pre_second * 1000);

            //doframe要做的事情
            for (let move of moves) {

                    let block = this.blocks[[move[0][0]]][move[0][1]];

                    //开始时的坐标
                    let origin = this.getGirdPosition(move[0][0], move[0][1]);
                    let destination = this.getGirdPosition(move[1][0], move[1][1]);
                    //移动中的坐标
                    //两点坐标问题，画图理解下,走的百分比 curTime / totalTime
                    let currPosition = [
                        origin[0] + curTime / totalTime * (destination[0] - origin[0]),
                        origin[1] + curTime / totalTime * (destination[1] - origin[1])

                    ];
                    //键盘按的很快时的优化，两种方法
                    //
                if (block) {
                    block.style.top = currPosition[0] + 'px';
                    block.style.left = currPosition[1] + 'px';
                }
            }
        } else {
            view.drawGame();

        }
    }

    animate(moves) {
        this.doFrame(moves, 0, animateTime);
    }

    drawGame() {
        //画之前把之前的数据清除
        this.container.innerHTML = "";
        this.blocks = [];
        for (let i = 0; i < gameSize; i++) {
            let temp = [];
            for (let j = 0; j < gameSize; j++) {
                this.drawBackgroundBlock(i, j, BackGroundColor);
                //保证是4*4矩阵
                let block = null;
                if (this.game.data[i][j]) {
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                temp.push(block);
            }
            //创建二维数组的另外一种方法
            this.blocks.push(temp);
        }
    }
    drawBackgroundBlock(i, j, color) {
        let block = document.createElement('div');
        //先求position
        let position = this.getGirdPosition(i, j);
        block.style.position = "absolute";

        block.style.width = blockSize + 'px';
        block.style.height = blockSize + 'px';
        block.style.backgroundColor = color;

        block.style.top = position[0] + 'px';
        block.style.left = position[1] + 'px';

        block.style.textAlign = 'center';
        block.style.zIndex=3;
        block.style.borderRadius=20+'px';
        this.container.append(block);
        //如果想要为当前有数字的格子添加上数字，则需要返回这个block
        return block;
    }
    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let currentColor=null;
        switch (number) {
            case 2:
                currentColor=BackCurrentColor2;
                break;
            case 4:
                currentColor=BackCurrentColor4;
                break;
            case 8:
                currentColor=BackCurrentColor8;
            case 16:
                currentColor=BackCurrentColor16;
                break;
            case 32:
                currentColor=BackCurrentColor32;
                break;
            case 64:
                currentColor=BackCurrentColor64;
                break;
            case 128:
                currentColor=BackCurrentColor128;
                break;
            case 256:
                currentColor=BackCurrentColor256;
                break;
            case 512:
                currentColor=BackCurrentColor512;
                break;
            case 1024:
                currentColor=BackCurrentColor1024;
                break;
        }
        let block = this.drawBackgroundBlock(i, j, currentColor);
        span.appendChild(text);
        span.style.lineHeight = 100 + 'px';
        span.style.fontSize = 50+'px';
        span.style.borderRadius=20+'px';
        span.style.color='#776E65';
        span.className='block';
        block.style.zIndex=10;
        block.appendChild(span);
        return block;
    }


}

//Controller
let container = document.getElementById("game-container");
let points=document.getElementById('current-score');
// let current=document.getElementById('currentPoints');
let bestPoints=document.getElementById('best-score');
let restart=document.querySelector('.new-game');
let game = new Game();
let view = new View(container, game);
if (!localStorage.getItem("maxScore")) {
    localStorage.setItem("maxScore",0);
}
view.drawGame();

bestPoints.innerText=`${localStorage.getItem("maxScore")}`;
//重新开始游戏
restart.addEventListener('click',function () {
    //重新初始化游戏，
    game.initializeData();
    points.innerHTML=`${game.points}`;
    view.drawGame();
});
//添加键盘事件
document.onkeydown = function (event) {
    let result =null;
    if (event.key == 'ArrowLeft') {
        result = game.advance('left');
    } else if (event.key == 'ArrowRight') {
        result= game.advance('right');
    } else if (event.key == 'ArrowDown') {
        result = game.advance('down');
    } else if (event.key == 'ArrowUp') {
        result = game.advance('up');
    }

    if (result&& result.moves.length>0) {
        points.innerHTML=`${game.points}`;
        best=localStorage.getItem("maxScore");
        bestPoints.innerText=`${best}`;

        view.animate(result.moves);
        //这里延时0.5秒，与最后一步 移动方块是需要时间的,
        //需要画好了，才有游戏结束的标志
        setTimeout(function () {
            if (result.over){
                alert("游戏结束了！");
                //代表游戏结束
                game.state=0;
            }
        },500);
    }
}

