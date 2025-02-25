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
## 安装 nodejs

### apt安装
由于想要在vscode连wsl刷leetcode，所以要安个nodejs，不太有版本要求所以就怎么方便怎么来了
1. 更新 
```bash
sudo apt update
```

2. 安装nodejs

```bash
sudo apt install nodejs
```
3. 安装npm
```bash
sudo apt install npm
```
4. 验证
```bash
node -v
```

## 配置c环境

1. 比较喜欢用clang，因为刚上本科的时候觉得codeblock devc++啥的界面太丑，然后就改成vscode了，第一次看到的帖子就是用clang的
```bash
sudo apt install clang clangd lldb cmake clang-format
```
2. vscode安装插件，clang cmake cmaketools clang-format啥的，cmaketools可能要vsix安装
3. 使用cmake新建一个项目，修改插件配置，再clangd的argument里加入
```
--compile-commands-dir=${workspaceFolder}/build
```
4. 生成launch文件，直接f5 main.cpp会自己生成，然后把program路径改成build下生成的可执行文件就好了
5. 配置clang-format， 风格改为Google，修改默认的format配置文件为clang-format

