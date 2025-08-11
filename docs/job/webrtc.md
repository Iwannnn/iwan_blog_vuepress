---
title: 基于 C++/FFmpeg 的跨平台视频播放与 WebRTC 实时推流
date: 2025-07-07
categories:
 - linux
 - wsl
 - 音视频
cover: /images/covers/mama.jpg
---


<!--  -->


## 环境配置

C++ 项目的依赖管理相比 Java 和 Python 要复杂得多。由于缺乏统一的跨平台包管理生态（虽然有 vcpkg、conan 等工具，但覆盖率有限），很多第三方库——尤其是音视频相关——仍需要手动下载源码并编译，这会带来版本兼容和构建环境配置上的额外成本。同时，C++ 项目的跨平台适配工作量也相对较大，不像 Java 有 JVM 屏蔽平台差异，Python 是解释执行。在没有使用交叉编译工具链的情况下，Linux 下直接编译的二进制文件是无法在 Windows 上运行的。

### linux下的播放器配置

项目初期想在wsl做，所以选择的环境是ubuntu wsl 2204

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

在git上下载源代码
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


### 迁移到windows mysy2

由于需要摄像头进行视频采集，wsl要调用到摄像头好麻烦所以就移植到windows了


#### 安装mysys2

下载mysys2安装包，安装一些需要的基础环境

基础工具
```bash
pacman -S --needed base-devel git cmake ninja pkg-config
```

安装FFmpeg,sdl,openssl,opencv,qt
```bash
pacman -S mingw-w64-x86_64-ffmpeg
pacman -S mingw-w64-x86_64-SDL2
pacman -S mingw-w64-x86_64-openssl
pacman -S mingw-w64-x86_64-opencv
pacman -S mingw-w64-x86_64-qt5
```


#### 编译安装 libdatachannel
```bash
git clone --recursive https://github.com/paullouisageneau/libdatachannel.git
```

安装相关依赖

```bash
sudo apt update
sudo apt install -y \
  libnice-dev libsrtp2-dev libssl-dev \
  cmake build-essential pkg-config
```

build config
```bash
cmake -B build -DUSE_GNUTLS=0 -DUSE_NICE=1 -DCMAKE_BUILD_TYPE=Release
cmake --build build
sudo cmake --install build
```

build
```bash
cmake --build build
```

最后在程序编译后生成可执行程序，执行时会需要一些dll动态链接库，要复制到统一个目录下，qt可能会存在版本冲突，所以在系统环境变量上要调整下顺序。


## 播放器

开发过程中遇到的一些问题吧，这一块的主要流程还是比较清晰的，打开文件-文件解复用-音视频解码-显示视频/播放音频-同步控制



- 首先是配置了cmake， 要开启 AUTOMOC AUTOUIC，设置好 Qt 和 FFmpeg 的依赖路径，源文件清晰列出，其实算是第一次写正式的cpp项目所以折腾了一会，然后要用qtcreator做ui的设计，pro文件，路径搞对，ui文件自动生成.h文件有点小坑，cmake是在src中找对应的cpp文件的ui文件的，同时要在cpp中#include "ui_xxx.h" 且调用了 setupUi(this)才会生成.h文件在build中，以路径啥的要搞对

- ffmpeg的函数使用的话头文件需要用extern "C"包进来，因为cpp会对函数进行重命名（name mangling）而c不会，ffmpeg提供的库是c的符号

- 本来想一起吧音频视频的播放实现，然后一直```segmentation fault (core dumped)```，这真是最最最令人崩溃的bug了，cmake配置好了后单步调试好方便，以前都是手动cout的啥的，但是在工程里就不方便了，现在是真的调试真香了，发现在QApplication初始化的时候就出问题了，就找找然后是SDL的不兼容问题就先删了先把视频的播放实现了。

- 实现了音视频的同步播放，之前不行的sdl处理音频删了后重新写不知道怎么又行了

- 音视频同步，通过视频的pts和音频的clock加上threshold实现了同步，我的video_pts始终大于audio_clock，原因：video_pts 表示这帧应当被播放的绝对时间，audio_pts 是当前已送入 SDL 播放队列的最后一帧时间戳,audio_clock = audio_pts - delay 表示正在播放的音频的真实时间位置，delay代表尚未播放的时间。

## webrtc推流

推流功能的主要步骤
1. 新建WEBRTCConnection类，封装PeerConnection，SDP，ICE，包括一些回调函数
2. 利用websocket作为信令通道，交换sdp和ice，实现caller和callee的配对，sdp包括后续交换的一些规范，ice是ip与端口与内网穿透相关
3. 启动摄像头，捕获摄像头帧，使用ffmpeg进行h264编码，RTP分包后再传输

碰到的一些问题
- h264编码的格式需要与浏览器解码方面的统一，
- rtp分包这个东西，我原本自己是不知道的，然后建立连接后弄了好几天都无法发送，问了很久ai，百度谷歌啥的找了总是不行（还是有点小众），然后去看了libdatachannel的examples源代码，按照源代码的流程改了下建立连接与发送数据的代码才成功，看源码还是有用很多啊

