# watchstocks-app 任务 
完成watchstocks-app 任务

服务演示地址[https://xdswatchstocksapp.herokuapp.com/](https://xdswatchstocksapp.herokuapp.com/)

## 任务需求
1. 可以观看到所有添加股票的最近行情
1. 可以添加新的股票（通过诸如股票代码）进行检测
1. 可以移除股票
1. 可以实时看到其他用户添加、删除的股票
1. 不用登陆即可完成上述任务

## 实现说明

1. 使用了`mongodb`数据库服务用于持久化数据,数据利用[https://mlab.com](https://mlab.com)提供的500MB免费数据空间部署(因为herokuapp上直接使用mongodb需要付费！这里是免费的，用着任务展示已经足够)，使用`mongodb`模块访问数据库服务，你也可以使用其他mongodb数据服务。
1. 使用`ejs`作为模版处理模块
1. 使用`highstock`作为信息展示模块
1. 客户端轮询机制实现同步信息
1. 使用`SOHU`提供的历史股票数据


## 关于`.env`文件或者环境变量
  
## 待完善或补充（不一定实施）
1. 其实可以不使用`mongodb`，因为这个程序并不需要持久化数据，仅仅是程序运行期。这样还可以实现池模式，即仅允许有限数量的股票


