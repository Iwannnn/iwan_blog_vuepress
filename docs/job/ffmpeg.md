---

title: cpp音视频开发
date: 2024-06-17
cover: /images/covers/
categories:
 - job

---


<!-- more -->

## 想找的工作方向

主要的方向是希望找cpp这一块的开发，因为比较喜欢c家族的代码风格吧。本科阶段写了挺多的javaweb项目，虽然没到达什么很深的阶段，但是还是觉得不是很喜欢这一块的开发。

调查了一下cpp的工作方向主要有嵌入式，云原生，游戏开发，qt桌面客户端，数据库存储，linux服务器方向。

我对linux的只是，简单的使用都是比较熟悉的，但是对更底层的接口就没怎么接触过。

虽然比较喜欢玩游戏，但是感觉游戏开发这个工作还是比较难找。

对于云原生，大数据存储了解的就更少了。

而音视频在现实生活中接触的比较多吧，而且感觉未来使用的场景也会随着传播媒介、应用场景的变化应该也不太会死掉。比较人的感官嗅觉和触觉还是比较难实现数字化的，视觉和听觉我觉得还是会一直用到。（赛博飞升，人脑接口，这大概也是离不开音视频数据传输的吧


## 计划一下

打算是做一个比较综合一点的项目，*音视频+linux后台（操作系统中的只是）+qt前端*，即使没找到音视频的工作也能有个qt相关的保底项目吧。

按照gpt老师的建议，要是分成几个学习阶段，同时也不能落下每天的算法代码部分。

| 阶段     | 主要任务                           | 输出成果                                  |
| -------- | ---------------------------------- | ----------------------------------------- |
| 第一阶段 | 音视频基础知识 + FFmpeg 命令行操作 | 写笔记 + 用命令完成转码、截图、裁剪等任务 |
| 第二阶段 | FFmpeg 解码流程 + 播放器框架入门   | 实现 YUV 视频文件播放                     |
| 第三阶段 | 音视频同步 + SDL 渲染              | 音视频同步播放 demo                       |
| 第四阶段 | 实现推流功能（摄像头 / 桌面）      | RTMP 推流 demo（配合 OBS / NGINX 测试）   |
| 第五阶段 | Qt + FFmpeg 简易播放器界面         | Qt 播放器 GUI 初版                        |


## ffmpeg

### stage 1


#### 音视频基础知识


**常见封装格式对比**
| 封装格式 | 全称/别名        | 主要用途            | 支持音视频轨 | 典型特点                     | 应用场景                 |
| -------- | ---------------- | ------------------- | ------------ | ---------------------------- | ------------------------ |
| **MP4**  | MPEG-4 Part 14   | 通用型播放与存储    | ✅            | 结构复杂，索引强，兼容好     | 本地播放、在线视频、存储 |
| **FLV**  | Flash Video      | 网络流媒体传输      | ✅            | 封装简单、延迟低，适合直播   | Flash 播放器、RTMP 直播  |
| **MKV**  | Matroska         | 高质量/多轨封装     | ✅            | 可封多轨字幕、音频，灵活开放 | 本地高清视频、多音轨资源 |
| **TS**   | Transport Stream | 广播/传输流媒体传输 | ✅            | 片段化强，适合流媒体逐段播放 | 直播、HLS（.m3u8 + .ts） |

**音视频网络协议封装格式对比表**
| 协议       | 封装格式 | 传输方式            | 延迟 | 支持双向？ | 典型用途                 | 特点总结                                     |
| ---------- | -------- | ------------------- | ---- | ---------- | ------------------------ | -------------------------------------------- |
| **RTMP**   | FLV      | 基于 TCP            | 低   | 否         | 直播推流（如 OBS）       | 实时性强、部署简单、兼容广                   |
| **RTSP**   | RTP      | TCP / UDP           | 低   | 是         | 摄像头、监控系统         | 支持控制命令（PAUSE/PLAY），低延迟           |
| **HLS**    | TS       | 基于 HTTP           | 高   | 否         | 网页直播 / 点播          | 分片传输、兼容性强、CDN 支持好               |
| **MMS**    | ASF      | TCP / UDP           | 中   | 否         | Windows Media 流媒体     | 已过时，被 RTSP 和 HLS 取代                  |
| **WebRTC** | SRTP     | UDP + ICE/STUN/DTLS | 极低 | 是         | 实时音视频通信、连麦互动 | 原生双向通信、极低延迟、浏览器支持、实现复杂 |

| 概念     | 定义                                                               |
| -------- | ------------------------------------------------------------------ |
| **编码** | 把原始音视频数据（如 YUV、PCM）压缩成可传输的格式（如 H.264、AAC） |
| **解码** | 把压缩数据（如 H.264、AAC）还原成原始数据，供播放或编辑使用        |

> YUV 是一种广泛使用的颜色编码格式，主要用于视频处理和压缩领域，用来表示图像的颜色信息。


视频编码格式大全
| 格式名     | 全称 / 简称     | 压缩效率    | 延迟 | 应用场景                 | 特点说明                                    |
| ---------- | --------------- | ----------- | ---- | ------------------------ | ------------------------------------------- |
| **H.264**  | AVC             | 高          | 中   | 视频播放、录制、直播     | 主流格式，兼容性好，支持 B 帧               |
| **H.265**  | HEVC            | 更高        | 中   | 4K/8K 视频、高清视频传输 | 压缩率比 H.264 高约 30%，需更强硬件解码     |
| **AV1**    | AOMedia Video 1 | 极高        | 高   | 未来网页视频、开源播放器 | 开源免费，压缩率比 H.265 更高，但编码速度慢 |
| **VP8**    | Google VP8      | 中等        | 低   | WebRTC、YouTube          | 开源、适合实时，替代 H.264                  |
| **VP9**    | Google VP9      | 高          | 中   | YouTube、网页高清视频    | 支持 4K，开源，压缩比优于 H.264             |
| **MPEG-2** | —               | 低          | 低   | DVD、广播电视            | 老旧格式，兼容性强但压缩率低                |
| **MJPEG**  | Motion JPEG     | 低          | 低   | 摄像头、老式录像设备     | 每帧为一张 JPEG，简单快速，但体积大         |
| **ProRes** | Apple ProRes    | 无损/轻压缩 | 高   | 后期剪辑、专业摄像       | 高质量中间格式，不适合播放或传输            |

> 压缩效率指的是在相同画质下，所需的数据量（码率）有多小。
> 延迟是指从采集或读取一帧数据，到它被成功编码传输并最终播放出来之间的时间间隔。


| 概念     | 表示的意义             | 越高表示…              |
| -------- | ---------------------- | ---------------------- |
| 压缩效率 | 同样画质下文件有多小   | ✅ 更节省体积和带宽     |
| 延迟     | 从编码到播放的等待时间 | ❌ 越高越不适合实时传输 |


音频编码格式大全
| 格式名        | 全称                      | 压缩方式 | 延迟 | 应用场景             | 特点说明                            |
| ------------- | ------------------------- | -------- | ---- | -------------------- | ----------------------------------- |
| **AAC**       | Advanced Audio Coding     | 有损     | 低   | 主流播放器、视频音轨 | 比 MP3 更高效，H.264 搭配常用       |
| **MP3**       | MPEG Layer 3              | 有损     | 中   | 音乐播放、老设备     | 历史最广泛格式，兼容强              |
| **Opus**      | —                         | 有损     | 极低 | WebRTC、语音通话     | 支持宽频/语音切换，低延迟，实时性强 |
| **PCM**       | Pulse Code Modulation     | 无压缩   | 低   | 音频处理、硬件采集   | 原始格式，体积大但保真              |
| **FLAC**      | Free Lossless Audio Codec | 无损压缩 | 中   | 音乐收藏、高清音频   | 保留完整音质，压缩率较高            |
| **ALAC**      | Apple Lossless            | 无损压缩 | 中   | Apple 设备高质量音频 | 与 FLAC 类似，但用于苹果生态        |
| **AMR-NB/WB** | Adaptive Multi-Rate       | 有损     | 极低 | 手机语音通信         | GSM/VoLTE 通信编码标准              |


常见的容器格式
| 容器格式 | 可封装的视频编码        | 可封装的音频编码       |
| -------- | ----------------------- | ---------------------- |
| MP4      | H.264, H.265, AV1       | AAC, MP3, Opus         |
| MKV      | H.264, VP9, AV1, MPEG-2 | AAC, MP3, Vorbis, FLAC |
| AVI      | MPEG-4, H.264           | MP3, PCM               |
| FLV      | H.263, H.264            | MP3, AAC               |
| TS       | H.264, H.265            | AAC, AC3               |
| MOV      | H.264, ProRes           | AAC, PCM, ALAC         |


> 编码压缩数据以便传输或保存，解码还原数据以便播放或处理。没有编码，视频文件无法高效传播；没有解码，就无法播放它。

> SDL 是一个 C 语言编写的跨平台开发库，常用于音视频播放、图形渲染和事件处理。

| 功能           | 说明                                            |
| -------------- | ----------------------------------------------- |
| **视频显示**   | 用于渲染 YUV 视频帧（例如 FFmpeg 解码后）       |
| **音频播放**   | 播放解码后的 PCM 音频数据                       |
| **窗口管理**   | 创建图形窗口，控制分辨率、刷新等                |
| **事件处理**   | 支持键盘、鼠标、窗口关闭等用户交互              |
| **跨平台支持** | 一次编写，运行在 Windows、Linux、macOS、Android |

**采样**

采样是将连续的模拟音频信号（analog），以固定时间间隔测量并记录成**数字信号（digital）**的过程。
| 参数       | 说明                                     |
| ---------- | ---------------------------------------- |
| **采样率** | 每秒采样次数，单位为 Hz（赫兹）          |
| **位深**   | 每个采样点的精度，单位为 bit（如 16bit） |

**重采样**

重采样是将已有的数字音频从一个采样率或通道格式转换为另一种采样率或格式的过程。

- 把 48000 Hz 转换为 44100 Hz（向下重采样）
- 把单声道变为双声道（通道重采样）
- 把 float32 格式变为 int16（格式重采样）



#### ffmpeg 命令行操作 

linux 安装

```bash
sudo apt update
sudo apt install -y \
  ffmpeg \
  libavcodec-dev libavformat-dev libavutil-dev libswscale-dev libswresample-dev \
  libsdl2-dev \
  libx264-dev libx265-dev libvpx-dev libfdk-aac-dev libmp3lame-dev libopus-dev \
  libass-dev libfreetype6-dev libvorbis-dev \
  pkg-config build-essential cmake git
```

| 库名                | 用途说明                                   |
| ------------------- | ------------------------------------------ |
| `ffmpeg`            | 命令行工具，包含 `ffprobe`、`ffplay`       |
| `libavcodec-dev`    | 编解码库（视频/音频解码器）                |
| `libavformat-dev`   | 封装/解封装库（MP4、FLV、MKV 等）          |
| `libavutil-dev`     | 工具函数库（时间戳、颜色转换）             |
| `libswscale-dev`    | 视频缩放、像素格式转换                     |
| `libswresample-dev` | 音频重采样                                 |
| `libsdl2-dev`       | 视频渲染/音频播放（配合 FFmpeg 播放器）    |
| `libx264-dev`       | H.264 编码器                               |
| `libx265-dev`       | H.265 编码器                               |
| `libvpx-dev`        | VP8/VP9 编码器                             |
| `libfdk-aac-dev`    | 高质量 AAC 编码器（需 `--enable-nonfree`） |
| `libmp3lame-dev`    | MP3 编码器                                 |
| `libopus-dev`       | WebRTC 用音频编码器                        |
| `libass-dev`        | ASS 字幕渲染                               |
| `libfreetype6-dev`  | 字体渲染（用于水印/字幕）                  |
| `libvorbis-dev`     | OGG/Vorbis 音频编码器                      |
| `pkg-config`        | 自动查找编译依赖                           |
| `build-essential`   | GCC、g++ 等基础开发工具链                  |
| `cmake`, `git`      | 编译构建与源码管理工具                     |


```bash
ffmpeg [global_options] -i [input_file] [input_options] [processing_options] [output_options] [output_file]
```


常用命令 


| 操作类别               | 命令示例                                                                                              | 说明                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **查看信息**           | `ffprobe input.mp4`                                                                                   | 显示媒体详细信息                                                             |
| **转码为 MP4**         | `ffmpeg -i input.avi output.mp4`                                                                      | 转码为 H.264/AAC 编码的 MP4                                                  |
| **指定编码器转码**     | `ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4`                                                | 手动设置视频/音频编码器                                                      |
| **调整码率**           | `ffmpeg -i input.mp4 -b:v 1000k -b:a 128k output.mp4`                                                 | 设置视频/音频目标码率                                                        |
| **调整帧率**           | `ffmpeg -i input.mp4 -r 30 output.mp4`                                                                | 设置输出帧率为 30 fps                                                        |
| **调整分辨率**         | `ffmpeg -i input.mp4 -s 1280x720 output.mp4`                                                          | 缩放为 720p                                                                  |
| **提取音频**           | `ffmpeg -i input.mp4 -vn -c:a copy output.aac`                                                        | 仅保留音频轨 -vn(video none)                                                 |
| **提取视频**           | `ffmpeg -i input.mp4 -an -c:v copy output.h264`                                                       | 仅保留视频轨 -av(audio none)                                                 |
| **音频转 WAV**         | `ffmpeg -i input.aac output.wav`                                                                      | 转为未压缩音频                                                               |
| **静音处理**           | `ffmpeg -i input.mp4 -an output.mp4`                                                                  | 移除音频轨                                                                   |
| **添加静音音轨**       | `ffmpeg -f lavfi -i anullsrc -i input.mp4 -shortest -c:v copy -c:a aac output.mp4`                    | 为无声视频添加静音  -f lavfi 使用 libavfilter 作为输入  -i anullsrc 虚拟输入 |
| **截取片段**           | `ffmpeg -ss 00:01:00 -i input.mp4 -t 10 -c copy clip.mp4`                                             | 从 1 分钟处截取 10 秒                                                        |
| **视频截图**           | `ffmpeg -ss 00:00:01 -i input.mp4 -frames:v 1 shot.png`                                               | 截取指定时间帧                                                               |
| **视频转图片序列**     | `ffmpeg -i input.mp4 img_%04d.jpg`                                                                    | 每帧输出为图片  %04d                                                         |
| **图片序列转视频**     | `ffmpeg -framerate 25 -i img_%04d.jpg -c:v libx264 output.mp4`                                        | 25fps 合成视频                                                               |
| **裁剪视频区域**       | `ffmpeg -i input.mp4 -filter:v "crop=640:360:0:0" output.mp4`                                         | 裁剪左上角 640×360 区域                                                      |
| **合并音视频**         | `ffmpeg -i video.mp4 -i audio.aac -c:v copy -c:a copy output.mp4`                                     | 封装合并                                                                     |
| **拼接视频（同编码）** | `ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4`                                                | 快速拼接                                                                     |
| **推流 RTMP**          | `ffmpeg -re -i input.mp4 -c:v libx264 -f flv rtmp://...`                                              | 本地文件推送到 RTMP 流媒体服务器                                             |
| **添加字幕**           | `ffmpeg -i input.mp4 -vf subtitles=sub.srt output.mp4`                                                | 内嵌软字幕                                                                   |
| **变速播放**           | `ffmpeg -i input.mp4 -vf "setpts=0.5*PTS" output.mp4`                                                 | 快放（2 倍速）                                                               |
| **视频加水印**         | `ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=10:10" output.mp4`                          | 左上角加水印                                                                 |
| **转为 HLS**           | `ffmpeg -i input.mp4 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename seg_%03d.ts out.m3u8` | 生成分片和索引用于直播                                                       |

参数
| 参数           | 说明                                                 | 默认值（如未指定）                                                                                                                                                     |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-i`           | 指定输入文件（input）                                | 必填，无默认值                                                                                                                                                         |
| `-ss`          | 指定起始时间（用于截取/跳转）seek start              | `0`（从开头开始）                                                                                                                                                      |
| `-t`           | 指定持续时间（配合 `-ss` 截取片段）                  | 到文件末尾                                                                                                                                                             |
| `-to`          | 指定结束时间（`-ss` 到 `-to`）                       | 到文件末尾                                                                                                                                                             |
| `-c`           | 同时设置音频和视频的编码器（codec）                  | 自动选择（mp4 → `libx264` + `aac`）                                                                                                                                    |
| `-c:v`         | 指定视频编码器，如 `libx264`                         | 依容器类型自动选择（如 `libx264`）                                                                                                                                     |
| `-c:a`         | 指定音频编码器，如 `aac`                             | 依容器类型自动选择（如 `aac`）                                                                                                                                         |
| `-vn`          | 不处理视频（video none）                             | 默认处理视频                                                                                                                                                           |
| `-an`          | 不处理音频（audio none）                             | 默认处理音频                                                                                                                                                           |
| `-sn`          | 不处理字幕（subtitle none）                          | 默认处理字幕                                                                                                                                                           |
| `-r`           | 设置帧率（frame rate）                               | 跟随输入帧率                                                                                                                                                           |
| `-s`           | 设置分辨率，如 `1280x720`                            | 跟随输入尺寸                                                                                                                                                           |
| `-b:v`         | 设置视频码率（bitrate）                              | 自动估算（CRF 编码时不需设定）                                                                                                                                         |
| `-b:a`         | 设置音频码率                                         | 自动估算（通常如 `128k`、`192k`）                                                                                                                                      |
| `-f`           | 指定格式（format），如 `mp4`、`flv`                  | 自动识别（根据输入/输出文件扩展名） 强制指定输入或输出的封装格式（format）常用于输入为虚拟格式（如 lavfi, concat），输出不带扩展名或需手动设定格式（如 flv, hls, mp4） |
| `-filter:v`    | 设置视频滤镜（如 `crop`、`scale`）                   | 无过滤器（原始传递）                                                                                                                                                   |
| `-filter:a`    | 设置音频滤镜（如 `volume`）                          | 无过滤器                                                                                                                                                               |
| `-map`         | 精确指定输入的哪些流要输出                           | 自动选择主流（如第一个音视频）                                                                                                                                         |
| `-threads`     | 设置使用线程数量                                     | 自动检测 CPU 线程                                                                                                                                                      |
| `-y`           | 自动覆盖已有文件（不提示）                           | 默认 `false`（需确认）                                                                                                                                                 |
| `-n`           | 若输出文件已存在则不执行（no overwrite）             | 默认 `false`（允许覆盖）                                                                                                                                               |
| `-hide_banner` | 隐藏启动时版权和配置信息                             | 默认显示                                                                                                                                                               |
| `-loglevel`    | 设置日志级别，如 `quiet`、`info`、`error`            | `info`                                                                                                                                                                 |
| `-re`          | 以实际速度读取输入（用于推流）                       | 默认关闭                                                                                                                                                               |
| `-vf`          | 视频滤镜（video filter）的快捷写法（同 `-filter:v`） | 同 `-filter:v`                                                                                                                                                         |
| `-af`          | 音频滤镜（audio filter）的快捷写法（同 `-filter:a`） | 同 `-filter:a`                                                                                                                                                         |
| `-movflags`    | 设置 MP4 特性，如 `faststart` 优化网页加载           | 默认不设置（需显式添加）                                                                                                                                               |
| `-preset`      | 编码速度设置（`ultrafast` → `veryslow`）             | `medium`（x264/x265 默认）                                                                                                                                             |
| `-crf`         | 设置恒定质量值（常用于 x264 编码，范围 0–51）        | `23`（推荐范围 18–28）                                                                                                                                                 |
| `-profile:v`   | 设置视频编码的 profile（如 `main`、`high`）          | 由编码器自动选择                                                                                                                                                       |
| `-level`       | 设置编码等级（如 `4.0`、`5.1`）                      | 由编码器自动选择                                                                                                                                                       |

#### ffmpeg 源码

##### stage1 主控流程

```scss
main()
├── init_dynload()
├── av_log_set_flags()
├── parse_loglevel()
├── avdevice_register_all()
├── avformat_network_init()
├── show_banner()
├── sch = sch_alloc()
├── ffmpeg_parse_options()      ← 参数解析 & 打开输入输出
├── 检查输入输出是否为空
├── get_benchmark_time_stamps()
├── transcode()                 ← 关键转换流程
├── get_benchmark_time_stamps()
├── ffmpeg_cleanup()
└── sch_free()
```

transcode这个部分会启动并且执行任务

| 阶段   | 执行线程     | 操作内容（操作码）             | 代表函数/结构                                                         | 典型命令示例                                                   |
| ------ | ------------ | ------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| Demux  | Demux 线程   | 拆包（读取媒体文件或流）       | `avformat_read_frame`                                                 | `ffmpeg -i input.mp4`                                          |
| Decode | Decoder 线程 | 解码（压缩数据 → 原始帧）      | `avcodec_send_packet`, `avcodec_receive_frame`                        | `ffmpeg -i input.mp4 -c:v rawvideo -f null -`                  |
| Filter | Filter 线程  | 滤镜处理（剪辑、缩放、裁剪等） | `av_buffersrc_add_frame`, `avfilter_graph`, `av_buffersink_get_frame` | `ffmpeg -i input.mp4 -vf "trim=start=10:end=20,scale=640:360"` |
| Encode | Encoder 线程 | 编码（原始帧 → 压缩包）        | `avcodec_send_frame`, `avcodec_receive_packet`                        | `ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4`          |
| Mux    | Muxer 线程   | 封装为输出文件或推流           | `avformat_write_header`, `av_write_frame`, `av_write_trailer`         | `ffmpeg -i input.mp4 -f flv rtmp://server/live/stream`         |

##### stage2 封装模块 mux demux

##### stage3 编码模块 encode decode

##### stage4 滤镜模块 filter