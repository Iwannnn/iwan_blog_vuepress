---
title: 毕业设计-基于深度学习的RGB-D相机货物体积测量
date: 2023-03-06
categores:
 - 深度学习
tags:
 - pytorch
 - cuda
cover: /images/covers/blue.jpg
---

## 毕业啦

### 环境配置

#### cuda

- 查看自身显卡最高支持的cuda版本，在命令行输```nvidia-smi```，去官网下载合适版本，当前pytorch最高支持到11.7

- 安装cudnn并添加至环境变量

#### anaconda

- 使用anaconda创建一个新的虚拟环境
  
```cmd
conda create -n yolact python=3.7
```

- 激活新的虚拟环境
  
```cmd
conda activate yolact
```

- 安装一些必要的包

```cmd
pip install cython
pip install opencv-python pillow pycocotools matplotlib 
```

- pycocotools安装有可能会出现问题
  
```cmd
pip install pycocotools-windows
```

- 安装pytorch，使用conda指令安装很麻烦，网络总是有问题，所以用pip安装,[官网](https://pytorch.org/get-started/locally/) 

```cmd
pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu117
```

检查安装是否正确

```python
import torch
print(torch.cuda.is_available())
```

#### yolact

- 从git上下载，```git clone https://github.com/dbolya/yolact.git```

- 在yolact的github页面中找到练好的weights文件下载，并在拉下来的yolact文件中新建weights文件夹存放在里面。

#### 环境测试

**图片**

```python
# Display qualitative results on the specified image.
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --image=my_image.png

# Process an image and save it to another file.
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --image=input_image.png:output_image.png

# Process a whole folder of images.
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --images=path/to/input/folder:path/to/output/folder
```

**视频**

```python
# Display a video in real-time. "--video_multiframe" will process that many frames at once for improved performance.
# If you want, use "--display_fps" to draw the FPS directly on the frame.
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --video_multiframe=4 --video=my_video.mp4

# Display a webcam feed in real-time. If you have multiple webcams pass the index of the webcam you want instead of 0.
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --video_multiframe=4 --video=0

# Process a video and save it to another file. This uses the same pipeline as the ones above now, so it's fast!
python eval.py --trained_model=weights/yolact_base_54_800000.pth --score_threshold=0.15 --top_k=15 --video_multiframe=4 --video=input_video.mp4:output_video.mp4
```

### 训练数据集

#### 拍照片

相机高度70cm

在楼梯间里铺了白纸（越拍空隙越多），本来打算拍200张照片的，然后应急电源派没电了，拍了180张，有灰度图、深度图、强度图和点云。

#### 标注

**安装labelme**

- 在虚拟环境中下载labelme，
```cmd
pip install labelme
```

- 打开labelme程序，```labelme```
- 选择文件夹（复制了一份文件，并把深度图、强度图和点云删了），右键图片，选择 Create Polygans，对文件经行标注，把货物框起来，填入标签goods，选择next images并且保存annotations
- 将labelme格式文件进行转换，在存放照片的文件夹外新建文件label.txt，内容如下

```txt
__ignore__
_background_
goods
```

- 将文件转换为coco格式，进入```labelme/examples/instance_segmentation```文件夹，执行指令```python labelme2coco.py <data> <data_output> --labels <label.txt path>```其中```<data>```为输入的文件路径，```<data_outpuy>```为输出的路径，```<label.txt>```为上一步新建的label.txt文件的路径

```cmd
python labelme2coco.py E:\undergraduate\last\segment\data E:\undergraduate\last\segment\data\data_coco_out --labels E:\undergraduate\last\segment\label.txt
```

把获得的照片和annotations复制到yolact的data文件目录下


#### 训练

从[yolact](https://github.com/dbolya/yolact)处下载训练模型的weights文件，


```
# Trains using the base config with a batch size of 8 (the default).
python train.py --config=yolact_base_config

# Trains yolact_base_config with a batch_size of 5. For the 550px models, 1 batch takes up around 1.5 gigs of VRAM, so specify accordingly.
python train.py --config=yolact_base_config --batch_size=5

# Resume training yolact_base with a specific weight file and start from the iteration specified in the weight file's name.
python train.py --config=yolact_base_config --resume=weights/yolact_base_10_32100.pth --start_iter=-1

# Use the help option to see a description of all available command line arguments
python train.py --help
```

- 将使用labelme生成的文件拖入```yolact/data```中，修改该文件夹下的```config.py```文件，添加自己的配置；

```python
#设定自己的数据集位置j
iwan_dataset_config = dataset_base.copy({
    'name': 'Goods_Dataset',
    'train_images': './data/goods',
    'train_info': './data/goods/annotations.json',
    'valid_images': './data/goods',
    'valid_info': './data/goods/annotations.json',
    'has_gt': True,
    'class_names': ('goods'),
    'label_map': {1: 1}
})

yolact_base_config = coco_base_config.copy({
    'name': 'yolact_base',

    # Dataset stuff
    'dataset': iwan_dataset, # 数据集定义
    'num_classes': len(iwan_dataset.class_names) + 1,

    # Image Size
    'max_size': 550,

    # Training params
    'lr_steps': (280, 600, 700, 750),# 学习率衰减区间
    'max_iter': 400,# 最大迭代次数

    # Backbone Settings
    'backbone': resnet101_backbone.copy({
        'selected_layers': list(range(1, 4)),
        'use_pixel_scales': True,
        'preapply_sqrt': False,
        'use_square_anchors': True,  # This is for backward compatability with a bug

        'pred_aspect_ratios': [[[1, 1/2, 2]]]*5,
        'pred_scales': [[24], [48], [96], [192], [384]],
    }),

    # FPN Settings
    'fpn': fpn_base.copy({
        'use_conv_downsample': True,
        'num_downsample': 2,
    }),

    # Mask Settings
    'mask_type': mask_type.lincomb,
    'mask_alpha': 6.125,
    'mask_proto_src': 0,
    'mask_proto_net': [(256, 3, {'padding': 1})] * 3 + [(None, -2, {}), (256, 3, {'padding': 1})] + [(32, 1, {})],
    'mask_proto_normalize_emulate_roi_pooling': True,

    # Other stuff
    'share_prediction_module': True,
    'extra_head_net': [(256, 3, {'padding': 1})],

    'positive_iou_threshold': 0.5,
    'negative_iou_threshold': 0.4,

    'crowd_iou_threshold': 0.7,

    'use_semantic_segmentation_loss': True,
})

```

原本我自己设置了了一个```config```，但是程序似乎有什么字符换解析的过程，我的不是很合适就直接在给的上面改了

程序中没有提供轮次的修改，可根据最大迭代次数进行计算。比如我的数据集只有2000张左右，批次给的是4，我设置了25000，大概迭代轮次为50轮，可以根据自己数据集数量依次类推设置，lr_steps是学习率衰减区间，也可以根据自己设置的最大迭代次数进行设置。至此，配置也修改完成了。


- 进行训练 

```cmd
python train.py --config=yolact_iwan_config --batch_size=2/4
```

- 训练完后测试

```cmd
python eval.py --trained_model=weights/xxx.pth --score_threshold=0.3 --top_k=100 --image=xxx
python eval.py --trained_model=weights/yolact_base_61_1600.pth --score_threshold=0.3 --top_k=100 --images=data/goods_input:data/goods_output
```

#### 错误信息处理

- 出现```RuntimeError: Expected a ‘cuda’ device type for generator but found ‘cpu’```

在```train.py```文件中将```shuffle = True```更改为```shuffle = False```

- 出现```rgb must be 3 dimensional```

由于相机拍摄的不是rgb图像是灰度图，所以会报这个错误；具体的解决方式了，大概在报错上找到出错的文件，注释掉报错的语句还是啥的让他不检查rgb

- 出现```RuntimeError: Attempted to set the storage of a tensor on device "cuda:0" to a storage on different device "cpu".  This is no longer allowed; the devices must 
match.```

将```backbone.py```中的```state_dict = torch.load(path）```修改为
```state_dict = torch.load(path, map_location='cuda:0')```

- 出现```RuntimeError:CUDA error:out of memory```

```yolact```中的```train.py```默认```batch_size=8```，对于我卑微的1660ti实在是负担不起，在命令中加入参数```--batch_size=2/4```



### 问题

体积小的识别不出来，不规则形状，复杂场景识别错误；切换场景，货物叠加

计算体积意义，装车