---
title: 自己一些常用的有关linux配置修改
date: 2025-02-24
categories:
 - linux
 - wsl
cover: /images/covers/mi.png
---


<!--  -->

## wsl 修改磁盘分区

因为时不时要用到就记录下
最近开始准备找工作了，打算找c++，发现电脑上的环境没了，重新配置一下

1. 查看当前分区
```bash
wsl -l -v
```
2. 关闭wsl
```bash
wsl --shutdown
```
3. 导出wsl
```bash
# wsl --export <name> <target>
wsl --export Ubuntu-22.04 E:\wsl\Ubuntu-22.04.tar
```

4. 注销原先的wsl
```bash
# wsl --unregister <name>
wsl --unregister Ubuntu-22.04
```

5. 导入wsl
```bash
# wsl --import <name> <new wsl path> <wsl file path>
wsl --import Ubuntu-22.04 E:\wsl\ubuntu22-04 E:\wsl\Ubuntu22-04.tar
```

6.设置默认用户

```bash
#name config --default-user xxx
Ubuntu-22.04 config --default-user xxx
```
不知道为什么命令行里不好改，然后修改wsl下```/etc/wsl.conf```加入

```conf
[user]
default=iwan
```
## vim 的 <j><k> <esc>替换

在```/etc/.vimrc```中替换

```.vimrc
inoremap jk <ESC>
```



