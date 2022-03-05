# Upload - 断点续传组件

## 环境要求
Node版本： v12

## 启动

* npm run start
* 后端访问端口：3000

## Attribute

|     参数     |  类型  |      说明      | 默认 |                          备注                          |
| :----------------: | :----: | :------------: | :--: | :----------------------------------------------------: |
| headers  | Object  |    设置请求头    |      |  |
| before-upload   | Function  |  上传文件前的钩子，返回false则停止上传 |  |  
| accept | String |   接受上传的文件类型   |      |                                                   |
| upload-arguments | Object |   上传文件时携带的参数   |      |                                                 |
| with-credentials | Boolean |   是否传递Cookie   |  false    |                                                 |
| limit | Number |   最大允许上传个数   |  0    |         0为不限制                                        |
| on-exceed | Function |   文件超出个数限制时的钩子   |     |                                            |
| multiple | Boolean |   是否为多选模式   |   true  |                                            |
| base-url | String |   由于本组件为内置的AXIOS，若你需要走代理，可以直接在这里配置你的基础路径   |     |        |
| chunk-size | Number |   每个切片的大小   |  10M   |        |
| threads | Number |   请求的并发数   |  3   |        | 并发数越高，对服务器的性能要求越高，尽可能用默认值即可|
| chunk-retry | Number |   错误重试次数   |  3   |        | 分片请求的错误重试次数|

## Slot

|     方法名     |                         说明                         | 参数 | 备注 |
| :------------: | :--------------------------------------------------: | :--: | :--: |
| header | 按钮区域 |   |  无  |
| tip | 提示说明文字 |   |  无  |

## 后端接口：按文档实现即可

> 后端文档地址： <https://docs.apipost.cn/view/0e19f16d4470ed6b#287746>
