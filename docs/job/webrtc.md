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

### 主要流程

1. demuxer，解复用,得到视频format的上下文信息，并且得到视频流和音频流的idx

```cpp
int Demuxer::open_file(const QString &file_path) {
  //防止重复打开
  close();

  int ret = 0;
  // 打开视频
  ret = avformat_open_input(&fmt_ctx, file_path.toStdString().c_str(), nullptr,
                            nullptr);
  if (ret < 0) {
    qDebug() << "avformat_open_input failed";
    return -1;
  }

  // 获取流信息
  ret = avformat_find_stream_info(fmt_ctx, nullptr);
  if (ret < 0) {
    qDebug() << "av_find_stream_info failed";
    return -1;
  }

  // 查找视频流
  video_idx =
      av_find_best_stream(fmt_ctx, AVMEDIA_TYPE_VIDEO, -1, -1, nullptr, 0);
  if (video_idx < 0) {
    qDebug() << "No video stream found";
  }

  // 查找音频流
  audio_idx =
      av_find_best_stream(fmt_ctx, AVMEDIA_TYPE_AUDIO, -1, -1, nullptr, 0);
  if (audio_idx < 0) {
    qDebug() << "No audio stream found";
  }

  qDebug() << "Demux success, video idx:" << video_idx
           << "audio idx:" << audio_idx;
  return 0;
}
```

2. 打开音视频流，这里做了一个继承的操作，所以处理的接口是一样的

视频流
```cpp
int Controller::open_video_stream(AVFormatContext *fmt_ctx) {
  int v_idx = demuxer.get_video_idx();
  if (v_idx < 0) {
    qDebug() << "controller::open v_idx failed";
    return -1;
  }

  int ret = video_decoder.init_decoder(fmt_ctx, v_idx);
  if (ret < 0) {
    qDebug() << "no video steam";
    return 0;
  }

  AVCodecContext *v_ctx = video_decoder.get_codec_ctx();
  ret = video_processor.init_video_processor(v_ctx);
  if (ret < 0) {
    qDebug() << "controller::open_video_stream video_processor init failed";
    return -1;
  }
  return 0;
}
```
音频流
```cpp
int Controller::open_audio_stream(AVFormatContext *fmt_ctx) {
  int a_idx = demuxer.get_audio_idx();

  if (a_idx < 0) {
    qDebug() << "no audio stream";
    return 0;
  }

  int ret = audio_decoder.init_decoder(fmt_ctx, a_idx);
  if (ret < 0) {
    qDebug() << "controller::open_audio_stream open_stream failed";
    return -1;
  }

  AVCodecContext *a_ctx = audio_decoder.get_codec_ctx();

  ret = audio_processor.init_audio_processor(a_ctx);
  if (ret < 0) {
    qDebug() << "controller::open_audio_stream audio_processor init failed";
    return -1;
  }

  return 0;
}
```

3. 初始化解码器decoder，根据流的idx获取相应的编解码参数，并且根据参数中codec的id找到对应的codec编解码器，再根据这个codec分配一个codec的ctx上下文存储解码运行所需的所有信息，最后用用 codec 打开 codec_ctx，完成解码器实例的初始化。此后，这个 codec_ctx 就可以被用来接收压缩包（AVPacket）并输出解码后的帧（AVFrame）。

```cpp
int Decoder::init_decoder(AVFormatContext *fmt_ctx, int stream_idx) {
  int ret = 0;

  if (stream_idx < 0) {
    qDebug() << "stream_idx not found";
    return -1;
  }
  stream = fmt_ctx->streams[stream_idx];

  AVCodecParameters *codec_par = fmt_ctx->streams[stream_idx]->codecpar;
  codec = avcodec_find_decoder(codec_par->codec_id);
  if (!codec) {
    qDebug() << "avcodec_find_codec failed";
    return -1;
  }

  codec_ctx = avcodec_alloc_context3(codec);
  if (!codec_ctx) {
    qDebug() << "avcodec_alloc_context3 failed";
    return -1;
  }

  ret = avcodec_parameters_to_context(codec_ctx, codec_par);
  if (ret < 0) {
    qDebug() << "avcodec_parameters_to_context failed";
    return -1;
  }

  ret = avcodec_open2(codec_ctx, codec, nullptr);
  if (ret < 0) {
    qDebug() << "avcodec_open2 failed";
    return -1;
  }

  this->stream_idx = stream_idx;
  qDebug() << "video stream open success, stream index:" << stream_idx;
  return 0;
}
```

4. init_xxx_processor，这个部分是初始化一些音视频解析输出时要用的信息，视频的比较简单就是高度和宽度。音频的就比较多了有采样率 (sample_rate)、声道数 (channels)、采样格式 (sample_fmt)，还要初始化SDL音频输出，打开默认输出设备，配置重采样器

```cpp
int VideoProcessor::init_video_processor(AVCodecContext *codec_ctx) {
  if (!codec_ctx) return -1;

  width = codec_ctx->width;
  height = codec_ctx->height;

  return 0;
}

int AudioProcessor::init_audio_processor(AVCodecContext *codec_ctx) {
  if (is_init) {
    qDebug() << "Audio already initialized.";
    return 0;
  }

  int sample_rate = codec_ctx->sample_rate;
  int channels = codec_ctx->ch_layout.nb_channels;
  AVSampleFormat fmt = codec_ctx->sample_fmt;

  SDL_AudioSpec want_spec;
  SDL_zero(want_spec);
  want_spec.freq = sample_rate;
  want_spec.format = AUDIO_S16SYS;
  want_spec.channels = channels;
  want_spec.samples = 1024;
  want_spec.callback = nullptr;

  dev_id = SDL_OpenAudioDevice(nullptr, 0, &want_spec, &audio_spec, 0);

  if (dev_id == 0) {
    qDebug() << "Failed to open audio device" << SDL_GetError();
    return -1;
  }

  // 设置输入和输出声道布局
  av_channel_layout_default(&in_layout, channels);
  av_channel_layout_default(&out_layout, channels);

  int ret = 0;

  ret = swr_alloc_set_opts2(&swr_ctx, &out_layout, target_fmt, sample_rate,
                            &in_layout, fmt, sample_rate, 0, nullptr);
  if (ret < 0) {
    qDebug() << "Failed to init SwrContext.";
    return -1;
  }
  ret = swr_init(swr_ctx);
  if (ret < 0) {
    qDebug() << "Failed to init Swr.";
    return -1;
  }
  SDL_PauseAudioDevice(dev_id, 0);
  is_init = true;

  return 0;
}
```

5. 根据qt的timer，定时触发```update_frame```，这里有个音视频的同步操作。

audio_clock 表示当前音频播放到的时间（秒），是播放器同步的基准时间。
计算方式是 
- 计算每秒字节数 bytes_per_sec = 采样率 * 声道数 * 每个采样的字节数。例如：48kHz * 2 声道 * 16 位 = 192000 字节/秒
- 获取当前缓冲区字节数 queue_bytes = SDL_GetQueuedAudioSize(dev_id); 这是 SDL 播放设备中等待播放的音频数据大小（单位：字节）。
- 转换成延迟时间 delay = queue_bytes / bytes_per_sec;
- 用 audio_pts 减去延迟 return audio_pts - delay; audio_pts 表示解码器送入缓冲的最后一帧音频的时间戳减去缓冲延迟，得到此刻声卡正在播放的位置

```frame->pts * av_q2d(stream->time_base);```pts通过这个计算得到，ac_q2d是分数转为浮点数，将时间戳的形式转为秒的形式，

video 就直接使用video_pts 表示当前要显示的视频帧的显示时间（秒）



我们将音频的播放作为一个基准主时钟，因为视频播放可以通过跳帧或延迟显示来跟上音频会比较方便，少一点帧数的影响也比较小。

- audio_clock：当前音频播放到的时间（已经减去缓冲延迟） → 基准
- video_pts：当前视频帧应该显示的时间（来自解码器 PTS） → 目标

理想情况下，video_pts 应该恰好等于 audio_clock。但实际中，解码、渲染、线程调度都有延迟，如果要求完全相等会造成视频帧等待过久、卡顿。所以给了一个 50ms 容忍窗口，如果视频的时间戳比音频时钟落后不超过 50ms，就立即显示。如果落后多了就丢弃跳帧，如果提前了那就等待

```cpp
double AudioProcessor::get_audio_clock() const {
  if (!is_init) return 0.0;

  int bytes_per_sec = audio_spec.freq * audio_spec.channels *
                      SDL_AUDIO_BITSIZE(audio_spec.format);
  Uint32 queue_bytes = SDL_GetQueuedAudioSize(dev_id);

  double delay = static_cast<double>(queue_bytes) / bytes_per_sec;

  return audio_pts - delay;
  // if (frame->pts != AV_NOPTS_VALUE) {
  //   audio_pts = frame->pts * av_q2d(stream->time_base);
  // }
}

double VideoProcessor::get_video_pts() const { 
  return video_pts; 
  // if (frame->pts != AV_NOPTS_VALUE) {
  //   video_pts = frame->pts * av_q2d(stream->time_base);
  // }
}

void MainWindow::update_frame() {
  if (controller.decode_frame() < 0) {
    timer->stop();
    return;
  }

  double audio_clock = controller.get_audio_clock();
  double video_pts = controller.get_video_pts();
  if (video_pts <= audio_clock + 0.05) {
    QImage img = controller.get_cur_image();
    if (!img.isNull()) {
      ui->labelVideo->setPixmap(QPixmap::fromImage(img).scaled(
          ui->labelVideo->size(), Qt::KeepAspectRatio,
          Qt::SmoothTransformation));
    }
  }

  double pos = audio_clock;
  double duration = controller.get_duration();
  if (duration > 0) {
    int value = static_cast<int>((pos / duration) * 100);
    ui->sliderProgress->blockSignals(true);
    ui->sliderProgress->setValue(value);
    ui->sliderProgress->blockSignals(false);

    ui->lableTime->setText(
        QString("%1 / %2").arg(format_time(pos)).arg(format_time(duration)));
  }
}
```

6. decode_frame,再update_frame中被调用，先从demuxer中先读取一个frame（这里的一帧不是解码后的原始帧，而是压缩码流的一部分：对视频来说，可能是一个完整的 H.264 NAL 单元，也可能是 B 帧、P 帧的数据。对音频来说，可能是一帧 AAC、MP3、Opus 数据），通过send_packet将压缩的pkt数据送进解码器，并且使用receive_packet得到解码后的数据。

video的process_frame需要做的是检查宽高，准备sws_format格式变化的上下文与缓冲区，调用sws_scale将原本的图像格式转换到目标格式，计算并更新 video_pts
audio的process_frame需要取输入通道数与样本数，用av_samples_get_buffer_size 为输出分配一块临时缓冲，swr_convert 做重采样与重排格式，用 frame->pts 计算 audio_pts，把转换后的数据通过 SDL_QueueAudio 入队播放。

```cpp
int Controller::decode_frame() {
  int ret = 0;
  ret = av_read_frame(demuxer.get_fmt_ctx(), pkt);
  if (ret < 0) {
    qDebug() << "controller::play_one_frame read_frame failed";
    return -1;
  }

  if (pkt->stream_index == video_decoder.get_stream_idx()) {
    if (video_decoder.send_packet(pkt) >= 0) {
      while (video_decoder.reveive_frame(frame) == 0) {
        video_processor.process_frame(frame, video_decoder.get_codec_ctx(),
                                      video_decoder.get_stream());
      }
    }
  } else if (pkt->stream_index == audio_decoder.get_stream_idx()) {
    if (audio_decoder.send_packet(pkt) >= 0) {
      while (audio_decoder.reveive_frame(frame) == 0) {
        audio_processor.process_frame(frame, audio_decoder.get_codec_ctx(),
                                      audio_decoder.get_stream());
      }
    }
  }

  av_packet_unref(pkt);
  return 0;
}

int VideoProcessor::process_frame(AVFrame *frame, AVCodecContext *codec_ctx,
                                  AVStream *stream) {
  // 检查输入帧是否有效
  if (!frame || !frame->data[0]) return -1;

  int width = codec_ctx->width;
  int height = codec_ctx->height;
  AVPixelFormat fmt = static_cast<AVPixelFormat>(frame->format);

  if (!sws_ctx || frame->format != video_fmt) {
    // 判断是否需要重新创建转换上下文
    if (sws_ctx) {
      sws_freeContext(sws_ctx);
      sws_ctx = nullptr;
    }

    video_fmt = static_cast<AVPixelFormat>(frame->format);
    sws_ctx = sws_getContext(frame->width, frame->height, video_fmt, width,
                             height, AV_PIX_FMT_RGB24, SWS_BILINEAR, nullptr,
                             nullptr, nullptr);
    if (!sws_ctx) return -2;
    last_image = QImage(width, height, QImage::Format_RGB888);
  }

  // 准备目标缓冲区
  uint8_t *dst_data[1] = {last_image.bits()};  //返回图像首地址
  int dst_lineszie[1] = {static_cast<int>(
      last_image.bytesPerLine())};  //返回每行像素所占字节数（用于行对齐）

  // 执行图像格式转换
  int ret = sws_scale(sws_ctx,
                      frame->data,  // 输入图像数据指针数组（如 YUV）
                      frame->linesize,  // 输入每行步长（每个平面）
                      0,                // 从第几行开始
                      height,           // 处理多少行
                      dst_data,         // 输出图像数据指针数组
                      dst_lineszie      // 输出每行步长
  );

  if (frame->pts != AV_NOPTS_VALUE) {
    video_pts = frame->pts * av_q2d(stream->time_base);
  }
  return (ret > 0) ? 0 : -3;
}


int AudioProcessor::process_frame(AVFrame *frame, AVCodecContext *codec_ctx,
                                  AVStream *stream) {
  int ret = 0;

  if (!is_init || !frame || !codec_ctx) {
    qDebug() << "Audio not initialized or invalid frame/context.";
    return -1;
  }

  // 获取输入通道数和样本数
  int in_channels = codec_ctx->ch_layout.nb_channels;
  int in_samples = frame->nb_samples;

  // 分配输出缓冲区
  int out_buf_size = av_samples_get_buffer_size(nullptr, in_channels,
                                                in_samples, target_fmt, 1);
  if (out_buf_size < 0) {
    qDebug() << "Failed to get output buffer size.";
    return -1;
  }

  uint8_t *out_buf = static_cast<uint8_t *>(av_malloc(out_buf_size));
  if (!out_buf) {
    qDebug() << "alloc buf failed";
    return -1;
  }

  // 格式转换（重采样）
  uint8_t *out[] = {out_buf};
  int conv_samples = swr_convert(
      swr_ctx,     //音频重采样上下文
      out,         //输出缓冲区数组，out[i] 是第 i 个通道的指针
      in_samples,  //输出的最大采样数（每个通道）
      const_cast<const uint8_t **>(
          frame->data),  //输入缓冲区数组，指向解码帧每个通道的 PCM 数据
      in_samples  //输入帧中每个通道的采样数
  );
  if (conv_samples < 0) {
    qDebug() << "swr_convert failed.";
    av_free(out_buf);
    return -1;
  }

  if (frame->pts != AV_NOPTS_VALUE) {
    audio_pts = frame->pts * av_q2d(stream->time_base);
  }

  // 推送音频数据到播放队列
  ret = SDL_QueueAudio(dev_id, out_buf, out_buf_size);
  if (ret < 0) {
    qDebug() << "SDL_QueueAudio failed:" << SDL_GetError();
    av_free(out_buf);
    return -1;
  }

  // 释放临时
  av_free(out_buf);
  return 0;
}

```

### 小问题
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

