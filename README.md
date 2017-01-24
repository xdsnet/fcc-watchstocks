# watchstocks-app 任务 
完成watchstocks-app 任务

服务演示地址[https://xdswatchstocksapp.herokuapp.com/](https://xdswatchstocksapp.herokuapp.com/)

## 任务需求
1. 作为一个未授权用户，我可以看到我附近的所有酒吧。
1. 作为一个已授权用户，我可以把我自己添加到一个酒吧，表示我今晚将会去那儿。
1. 作为一个已授权用户，如果我不再想去某个酒吧，可以把自己从酒吧中移出。
1. 作为一个未授权用户，在我登录后我不需要重新搜索附近的酒吧。

## 实现说明

1. 使用了`mongodb`数据库服务用于持久化数据,数据利用[https://mlab.com](https://mlab.com)提供的500MB免费数据空间部署(因为herokuapp上直接使用mongodb需要付费！这里是免费的，用着任务展示已经足够)，使用`mongodb`模块访问数据库服务，你也可以使用其他mongodb数据服务。
1. 使用`ejs`作为模版处理模块
1. 使用`stormpath`实现注册和认证处理(相关数据信息等存储在stormpath网站上，这样减轻了本地处理的繁琐。)
1. 使用`foursquare服务`的相关服务实现全球搜索。（本版先实现服务器端代理搜索，客户端展示，服务器端仅仅实现少量数据存储（仅存储是否到店的信息））

## 关于`.env`文件或者环境变量
  
## 待完善或补充（不一定实施）


