class GameEvaluation extends  Game{
    constructor(game) {
        super();
        //复制当前游戏的完整状态--所有的信息
        this.data=JSON.parse(JSON.stringify(game.data));
        this.points=game.points;
        this.parent=null;
        this.children={};
        //是一个对象数组
        this.bestChildren=null;
        //记录父亲往哪边移动
        this.move=null;
        //this 是父亲

    }
    copy(){
        let ret =new  GameEvaluation(this);
        //f复制自己
        return ret;
    }
    // 运行后至多有4个孩子
    evaluateNextStep(){
        for(let command of ['left','right','up','down']){
            //用深拷贝，自己不能变，复制一份，建立儿子，让儿子去找
            //this 是父亲，next 是儿子，得先我往下走一步advance（command）—这里就成了儿子

            let next= this.copy();
            let result =next.advance(command);
            //如果能移动（往下走），就有儿子了,赋值
            if (result.moves.length>0){
                this.children[command]=next;
                next.parent=this;
                //我（孩子）从哪里来的，保存父亲的move
                next.move=command;
            }else {
                this.children[command]=null;
            }
        }
    }
    //'我'现在告诉我爸我的成绩如何，让爸判断我是不是它最好的孩子，
    // 再让爸告诉爷爷，让爷爷判断我是不是最好的孙子
     backPropagate(){
        // 我-爸-爷爷-祖父 从我（node）叶子结点 开始
         let node=this;
         let points=this.points; //当前我的分数
         while(node.parent){
             if(node.parent.bestChildren==null
                 || node.parent.bestChildren.points < points){
                //此时我是最好的孩子，该函数中node是一直变化的
                 node.parent.bestChildren={
                     "move":node.move,
                     "points":points

                 }
             }
             node=node.parent;
         }
    }

}

class GameAgent{
    constructor(){
        //不能深拷贝，我要随时观察game的情况，game变了，要做出相应的改变
        this.game=game;
    }
    //bfs,决策树
    evaluate(depth=4){
        let currGame=new GameEvaluation(this.game);
        //层级来看
        //其实是个list，是前面加是O(N)，后面加是O(1)
        //我现在需要再往下延申的所有结点
        let queue=[currGame];
        //接下来我要延申的结点
        //两个quene的好处，1.层级可控
        let nextQuene=[];

        //depth 层级
        for (let i=0;i<depth;i++){
            for (let g of queue){
                //每一个现在的queue里面都有我接下来需要延伸的结点，往下涨一层
                g.evaluateNextStep();//往下长一层，长出来的结点需要放在接下要涨的这一层
                //cmd 是 left
                //g.children 是一个对象
                //g.key== g['key']
                //g.children.cmd== g.children['cmd']!=g.children[cmd]
                for(let cmd in g.children){
                    if (g.children[cmd]) {
                        nextQuene.push(g.children[cmd])
                    }
                }
            }
            queue=nextQuene;
            nextQuene=[];
        }
        // queue里面的结点是叶结点
        for(let g of queue){
            g.backPropagate();
        }
        return currGame.bestChildren;
    }
    //输出
    issueCommand(command){
        let mapping={
            "left":"ArrowLeft",
            "right":"'ArrowRight",
            "up":"ArrowUp",
            "down":"ArrowDown"
        }
        let event=new KeyboardEvent("keydown",{"key":mapping[command]});
        //dispatchEvent  向一个指定的事件目标派发一个事件,  并以合适的顺序同步调用目标元素相关的事件处理函数
        document.dispatchEvent(event);
    }
    //自己玩
    play(rounds=100){
        //rounds玩的次数
        if (rounds>0) {
            let result=this.evaluate();
            this.issueCommand(result.move);
            setTimeout(() => {
                this.play(rounds-1);
            }, 200)
        }
    }
}