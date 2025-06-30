---

title: player
date: 2024-06-30
cover: /images/covers/
categories:
 - job
 - cpp
 - ffmpeg
 - qt

---

在做webrtc之前，先弄个播放器熟悉ffmeg，qt和linux开发等

<!-- more -->

## 播放器


### 20250630

开始弄这个了，之前学了一段时间的音视频基础和ffmpeg的编码解码流程

1. 首先是配置了cmake， 要开启 AUTOMOC AUTOUIC，设置好 Qt 和 FFmpeg 的依赖路径，源文件清晰列出，其实算是第一次写正式的cpp项目所以折腾了一会
2. 然后要用qtcreator做ui的设计，pro文件，路径搞对
3. ui文件自动生成.h文件有点小坑，cmake是在src中找对应的cpp文件的ui文件的，同时要在cpp中#include "ui_xxx.h" 且调用了 setupUi(this)才会生成.h文件在build中，以路径啥的要搞对