'use strict';
// 安装 humane 的弹出通知
var notifier = humane.create({baseCls: 'humane-jackedup', timeout: 2000});
notifier.error = notifier.spawn({addnCls: 'humane-jackedup-error'});
notifier.success = notifier.spawn({addnCls: 'humane-jackedup-success'});
// notifier.error('错误消息！!');
// notifier.success('正确消息!');
var ERRCODE={
  "success":0,             // 无错误
  "codeErr":1,           // 股票代码无效
  "storeErr":2          // 数据未存储
  /*
  "":3,           //
  "":4,           //
  "":5,           //
  //*/
}
var _ERRCODE=["OK", // 0
    "股票代码无效",  // 1
    "监控列表不能存储"   //2
    ]
Highcharts.setOptions({ // 定义Highstock配置以展示中文
            lang: {
		        months: ['1月', '2月', '3月', '4月', '5月', '6月',  '7月', '8月', '9月', '10月', '11月', '12月'],
		        weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                shortMonths:['1月', '2月', '3月', '4月', '5月', '6月',  '7月', '8月', '9月', '10月', '11月', '12月'],
                rangeSelectorFrom:"从",
                rangeSelectorTo:"至",
                rangeSelectorZoom:"放缩"
	        }
        })

//var allStoct={};

var seriesOptions = [],  seriesCounter = 0, allleng=0; // 股票追踪数据
var listCounter = 0, listInfos=[]; // 股票信息数据
var lastdate=0; //最后更新时间
var toDay=""; // 今天日期字符串
var preYearDay=""; // 1年前日期字符串
var allStockList=[];
function creatInfoList(){
    var html=""
    $('#lists').html("") ;//
    if(listInfos.length){
        for(var i=0;i<allleng;i++){
            html+="<div class='infoShow'>股票代码:<span class='sCode'>"+listInfos[i][0]+"</span>股票名称:<span class='sName'>"+listInfos[i][1]+"</span><button class='sremove' type='button' onclick='removeList(\""+listInfos[i][0]+"\");'>取消追踪</button></div>"
        }
    }
    $('#lists').html(html);
}

    /**
     * Create the chart when all data is loaded
     * @returns {undefined}
     */
    function createChart() {
        $('#stocks').highcharts('StockChart', { // 配置图形化展示股票信息
            rangeSelector: {
                selected: 4
            },
            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            series: seriesOptions
        });
    }


var myping=function(){ // 心跳检测
    var _url="/ping";
    $.getJSON(_url,
        function(data){
            var newdate=data.lastdate;
            var newToDay=data.toDay;
            var newPreYearDay=data.preYearDay;
            if(lastdate!=newdate || newToDay != toDay){
                lastdate=newdate;
                toDay=newToDay;
                preYearDay=newPreYearDay;
                getList();
            }
        }
    )
}

var showList=function(data){
    // 显示追踪相关
    var alist=data.list;
    var err=data.err;
    var lastdate=data.lastdate
    var olist=[];
    var flag=false; // 标志是否需要更新追踪
    if(err){
        notifier.error(_ERRCODE[err]);
    }
    if(allStockList){ //更新存储的列表
        olist=allStockList;
    }
    if(alist.sort().toString()!=olist.sort().toString()){ //不同则重新存储
        allStockList=alist;
        flag=true;
    }
    if(flag){
        // 更新图示化追踪情况
        //notifier.success('正确消息!');
        //allStoct={}; // 清空以往数据
        seriesOptions=[]; //清空以往数据
        seriesCounter=0;
        listCounter = 0;
        listInfos=[];
        allleng=alist.length;
        creatInfoList();
        createChart();
        var allInfo=[]
        for(var i=0;i<allleng;i++){
            allInfo.push("cn_"+alist[i]);
            getA(alist[i]);
            getAInfo(alist[i]);
        }
    }else{
        //notifier.success('正确消息1!');
    }
}

var getAInfo=function(indata){
    var _url="/getAinfo/"+indata;
    $.getJSON(_url,
        function(data){
            listInfos.push(data.info[0])
            listCounter++;
            if(data.err){
                notifier.error(data.info[0]+"信息未查到");
            }
            if(listCounter===allleng){
                creatInfoList();
            }
        }
    )
}


var getA=function(inN){ // 股票数据获取
    //var _url="https://q.stock.sohu.com/hisHq?";
   // var _url="https://q.stock.sohu.com/hisHq?";
    var _url="//q.stock.sohu.com/hisHq?";
    _url+="code=cn_"+inN;
    _url+="&start="+preYearDay;
    _url+="&end="+toDay;
    _url+="&stat=1&order=A&period=d&rt=jsonp&callback=aStockHist"; // order=D是降序，order=A是升序，默认是降序,但升序才能满足动态展示。
    //var _url="http://q.stock.sohu.com/hisHq?code=zs_000001&start=20150504&end=20170126&stat=1&order=D&period=d&callback=historySearchHandler&rt=jsonp";
    $.ajax(
        {
            type:"get",
            async:false,
            url:_url,
            dataType:"jsonp",
            jsonp:"aStockHist",
            jsonCallback:"success_jsonpCallback"
        }
    );
    
}

var aStockHist=function(data){ // 股票数据获取后清洗（以满足 highstock展示需要）
    var id="";
    var hq=[];
    if(data.status){
        // 出错信息
        id=data.code;
        hq=[];
        notifier.error(id.replace("cn_","")+"股票信息未获取到");
    }else{
        id=data[0]["code"];;
        hq=data[0]["hq"];
    }

    var datas=[];
    for(var i=0;i<hq.length;i++){
        datas.push([(new Date(hq[i][0])).getTime(),parseFloat(hq[i][1]) ] );
    }

    seriesOptions.push({
        name:id.replace("cn_",""),
        data:datas
    });
    seriesCounter++;
    if(seriesCounter===allleng){
         createChart();
    }
}


var getList=function(){
    // 获取追踪列表
    var _url="/list";
    $.getJSON( _url,
         //获取到新列表后的处理
         showList
    );
}

var addHere=function(){ // 按钮触发添加动作
    var myAddId=$("#mysearch").val(); //获取待添加的股票代码
    myAddId=_.trim(myAddId)
    if(TestID(myAddId)){
        addList(myAddId);
    }
}

var TestID=function(id){ // 检测输入代码是否有效
    console.log(id);
    //*
    if(id.length!=6){
        notifier.error("输入代码不是6位，请检查！")
        //$("#mysearch").fouch();
        return false;
    }
    //*/
    if(/^[0-9]{6}$/.test(id)){
        return true;
    }else{
        notifier.error("输入代码不全是6位数字，请检查！")
    }
}

var addList=function(instr){
    // 添加最终列表
    var _url="/add/"+instr;
    $.getJSON( _url,
         //获取到新列表后的处理
         showList
    );
}

var removeList=function(instr){
    // 添加最终列表
    var _url="/remove/"+instr;
    $.getJSON( _url,
         //获取到新列表后的处理
         showList
    );
}