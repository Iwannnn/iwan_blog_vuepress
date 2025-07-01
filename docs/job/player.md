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

### 环境配置

wsl2中写的

#### qt配置

1. 安装Qt的组件

```bash
sudo apt-get install build-essential
```

2. 安装Qt的开发工具
```bash
sudo apt-get install qtbase5-dev qtchooser qt5-qmake qtbase5-dev-tools
```

3. 安装qtcreator
```bash
sudo apt-get install qtcreator
```

4. 安装qt
```bash
sudo apt-get install qt5*

```

5. wsl中文字体
```bash
sudo ln -s /mnt/c/Windows/Fonts /usr/share/fonts/font
fc-cache -fv
```

#### ffmpeg

1. configure
```
./configure \
  --prefix=/home/iwan/code/FFmpeg/build64 \
  --enable-shared \
  --disable-static \
  --disable-programs \
  --disable-doc \
  --disable-debug
```

2. ```make```
3. ```make install```

#### cmake

```txt
cmake_minimum_required(VERSION 3.16.0)
project(player VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)


# Qt
find_package(Qt5 REQUIRED COMPONENTS Widgets)

# output path
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/bin)

# FFmpeg include 和 lib 路径
set(FFMPEG_DIR /home/iwan/code/FFmpeg/build64)

# include path
include_directories(${FFMPEG_DIR}/include)      # 🔧 头文件路径
include_directories(${PROJECT_SOURCE_DIR}/include)

# lib path
link_directories(${FFMPEG_DIR}/lib)             # 🔧 库文件路径
set(CMAKE_INSTALL_RPATH "${FFMPEG_DIR}/lib")


add_executable(player 
  # src include
)


target_link_libraries(player
    Qt5::Widgets
    avfilter
    avformat
    avcodec
    avutil
    swresample
    swscale
)
```

### 20250630

开始弄这个了，之前学了一段时间的音视频基础和ffmpeg的编码解码流程

1. 首先是配置了cmake， 要开启 AUTOMOC AUTOUIC，设置好 Qt 和 FFmpeg 的依赖路径，源文件清晰列出，其实算是第一次写正式的cpp项目所以折腾了一会
2. 然后要用qtcreator做ui的设计，pro文件，路径搞对
3. ui文件自动生成.h文件有点小坑，cmake是在src中找对应的cpp文件的ui文件的，同时要在cpp中#include "ui_xxx.h" 且调用了 setupUi(this)才会生成.h文件在build中，以路径啥的要搞对

### 20250701

1. ffmpeg的函数使用的话头文件需要用extern "C"包进来，因为cpp会对函数进行重命名（name mangling）而c不会，ffmpeg提供的库是c的符号
2. 本来想一起吧音频视频的播放实现，然后一直```segmentation fault (core dumped)```，这真是最最最令人崩溃的bug了，cmake配置好了后单步调试好方便，以前都是手动cout的啥的，但是在工程里就不方便了，现在是真的调试真香了，发现在QApplication初始化的时候就出问题了，就找找然后是SDL的不兼容问题就先删了先把视频的播放实现了。