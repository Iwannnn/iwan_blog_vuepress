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
python labelme2coco.py E:\undergraduate\last\segment\data E:\undergraduate\last\segment\data_coco_out --labels E:\undergraduate\last\segment\label.txt
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
python train.py --config=yolact_base_config --batch_size=2/4
```

- 训练完后测试

```cmd
python eval.py --trained_model=weights/xxx.pth --score_threshold=0.3 --top_k=100 --image=xxx
python eval.py --trained_model=weights/yolact_base_91_3200.pth --score_threshold=0.7 --top_k=100 --images=data/goods_input:data/goods_output
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


### 名词解释

**backbone是什么是什么**

在深度学习中，backbone通常指的是神经网络中用于提取特征的主干部分。它是模型的核心部分，通常由多个卷积层和池化层等构成，负责从原始数据中提取高级语义特征。它可以将输入数据映射到高维空间中，从而使后续的任务，如分类、检测或分割等更容易处理。

例如，在图像分类任务中，backbone通常是由多个卷积层和池化层构成的卷积神经网络（Convolutional Neural Network, CNN），负责从图像中提取特征。在目标检测任务中，backbone可以是ResNet、VGG或MobileNet等，用于提取图像中的特征，并将这些特征传递给检测头部（detection head）进行目标检测。

在实践中，由于深度学习模型的复杂性，通常使用预训练的backbone，例如在图像分类任务中使用的VGG、ResNet、Inception等，这些预训练的backbone已经在大规模的图像数据集上进行了训练，并具有良好的特征提取能力。同时，这些预训练的backbone也可以在目标检测、图像分割等其他任务中使用，以提高模型的性能。

**anchor是什么意思**

在目标检测任务中，anchor（中文翻译为“先验框”或“锚框”）是指预定义的一组边界框，用于检测图像中的目标物体。具体来说，anchor是一组固定大小、宽高比和中心位置的矩形框，这些框在整个图像上进行平移和缩放，用于捕捉图像中的不同目标物体的位置和大小。

在目标检测任务中，通常将每个anchor与图像中的目标物体进行匹配，从而生成分类和回归目标。这个匹配过程通常基于IoU（Intersection over Union，即交并比）度量来判断anchor与真实目标框之间的重叠程度。如果anchor与某个目标框的IoU大于一定阈值，则将其标记为正样本（表示该框内有目标），否则标记为负样本（表示该框内无目标）。

anchor的数量、大小和宽高比等参数是根据数据集和任务进行调整的。通常，在目标尺寸变化较大的情况下，会使用多个大小和宽高比不同的anchor，以覆盖不同大小和形状的目标。在一些特定任务，如人脸检测、车牌检测等，则会使用特定大小和宽高比的anchor，以适应该任务中目标的形状和大小范围。

**proto_net是什么**

ProtoNet是一种基于原型（prototype）的学习方法，用于解决小样本学习（Few-Shot Learning）问题。在小样本学习中，模型需要从非常少的标记数据中学习，这通常是一个非常具有挑战性的问题。

ProtoNet是一种无监督的学习算法，它从输入样本中提取出特征，并将每个类别的原型表示为该类别中所有样本特征的平均值。然后，对于每个新的测试样本，ProtoNet将其特征向量与每个类别的原型进行比较，从而计算出其属于每个类别的概率，并选择概率最高的类别作为预测结果。

在实践中，ProtoNet通常用于小样本图像分类任务，其中包含非常少量的标记样本，例如只有几张图像。ProtoNet的核心思想是通过学习每个类别的原型来捕捉类别的概括特征，并利用这些特征进行分类。相对于传统的深度学习方法，ProtoNet的优势在于它可以通过较少的样本学习到类别的概括特征，从而在小样本学习中具有更好的泛化能力。

在深度学习中，Protonet通常指的是一种基于神经网络的模型，它主要用于解决分类任务。Protonet模型是一种元学习算法，其目标是从有限的样本数据中学习出一种泛化能力强的模型，从而能够快速适应新的任务。

Protonet模型基于Siamese神经网络和欧几里得距离度量学习，它的基本思想是将样本数据映射到一个低维的特征空间，然后计算不同样本之间的距离，从而得到它们之间的相似度。在训练过程中，Protonet模型通过最小化同类样本之间的距离、最大化异类样本之间的距离，来学习到一个泛化能力强的特征空间。

Protonet模型的应用场景非常广泛，比如图像分类、物体识别、语音识别等。它在小样本学习和零样本学习等领域具有较好的表现，能够有效地解决数据稀缺和类别丰富的问题。


**conv层是什么**

在深度学习中，Convolutional Layer（卷积层）是一种用于图像、视频、音频等信号处理的基本层。卷积层利用卷积操作对输入信号进行特征提取，通常用于图像分类、物体检测、语音识别等计算机视觉和语音处理任务中。

卷积层主要由两个部分组成：卷积核和特征图。卷积核是一个小矩阵，用于对输入信号进行卷积操作，提取局部特征。特征图是卷积核在输入信号上滑动计算得到的输出，也就是提取的特征图像。

卷积操作的本质是一种局部感知机制，通过卷积核对输入信号进行局部感知，并将每个位置的感知结果映射到输出特征图上。卷积核可以学习到不同的滤波器权重，以提取不同的特征，例如边缘、纹理、颜色等。

卷积层通常包括多个卷积核，每个卷积核提取不同的特征。同时，卷积层还包括其他的操作，如填充、步长、池化等，以控制输出特征图的大小和特征的数量。

在深度学习中，卷积层是构建卷积神经网络（CNN）的基础，也是图像、视频等信号处理的基本工具。

**relu层是什么**

ReLU (Rectified Linear Unit)是一种常用的激活函数，也可以看做是一种神经网络中的一种层（ReLU层）。ReLU层通常被用作深度学习模型中的非线性层，它可以对输入数据进行非线性变换，从而增强模型的表达能力。

ReLU层的数学表达式为：f(x) = max(0, x)，其中x为输入数据，max(0, x)表示取x和0的最大值。换言之，当输入大于等于0时，ReLU层会将其原样输出；当输入小于0时，ReLU层会将其变为0。这个简单的函数具有以下特点：

ReLU层是非线性的，可以处理非线性关系；
ReLU层的梯度在x>0时为1，x<=0时为0，可以缓解梯度消失问题；
ReLU层的计算速度非常快。
因此，ReLU层被广泛应用于深度学习模型中的卷积神经网络、全连接神经网络等各种网络结构中。

**池化层是什么**

池化层（Pooling Layer）是深度学习模型中的一种常见层，它通常用于减小卷积神经网络（CNN）等模型的特征图的空间大小，从而减少参数数量，避免过拟合，并提高模型的计算效率。池化层可以看做是一种降采样（Downsampling）技术，将输入数据的空间维度缩小，保留重要信息。

池化层通常的操作是在输入特征图的局部区域内进行采样和压缩，例如在2×2的窗口内取最大值或平均值等方式，来得到一个较小的输出特征图。常用的池化方法包括最大池化（Max Pooling）和平均池化（Average Pooling）。最大池化层选择每个窗口内的最大值作为输出，而平均池化层选择窗口内所有值的平均值作为输出。

池化层有以下几个优点：

减少特征图的空间大小，减少参数数量，避免过拟合；
提高模型的计算效率，减少计算量；
可以提取图像的纹理信息和抗噪能力。
池化层在卷积神经网络等深度学习模型中被广泛应用，常常和卷积层交替使用，以提高模型的表达能力和识别精度。

**什么是过拟合**

过拟合（Overfitting）是指在机器学习中，模型在训练数据上表现得非常好，但在测试数据上表现得很差的现象。简单来说，过拟合就是模型学习了训练数据中的噪声和随机性，导致其在新数据上的泛化能力下降。

过拟合是机器学习中常见的问题，特别是在模型具有很高的复杂度时容易发生。过拟合的表现形式包括模型在训练数据上的误差很小，但在测试数据上的误差很大，模型对训练数据过于敏感，无法处理新数据等。

导致过拟合的原因包括：

数据量太小，模型过于复杂，模型无法捕捉到真正的模式和规律。
训练数据中存在噪声和异常值，模型过于拟合这些数据。
模型过于复杂，导致参数过多，无法泛化到新数据。
训练数据和测试数据分布不一致，模型过拟合了训练数据的特定分布。
为了避免过拟合，可以采取以下措施：

增加数据量，减少数据的随机性和噪声。
简化模型，降低复杂度，避免过拟合。
采用正则化方法，如L1、L2正则化，Dropout等，减少模型的过度拟合。
采用交叉验证的方法，检验模型在不同数据集上的性能，确保模型具有较好的泛化性能。

**FPN是什么**

FPN（Feature Pyramid Network）是一种用于目标检测和语义分割任务的深度学习模型。它通过在深度卷积神经网络中添加横向连接，从不同层次的特征图中提取特征，并形成具有多尺度感受野的特征金字塔结构，从而提高模型的准确性和稳定性。

具体地说，FPN通过在主干网络中添加横向连接，将高层特征图和低层特征图进行融合，得到一个具有多尺度感受野的特征金字塔。具体来说，FPN主要包含以下两个步骤：

1. 自底向上的特征提取：在主干网络中提取多个不同尺度的特征图，每个特征图的感受野大小不同，通常采用卷积神经网络中的卷积层或池化层来实现。
2. 自顶向下的特征融合：从上往下将高层特征图向下采样，得到一系列不同尺度的特征金字塔，再将低层特征图和高层特征图进行融合，得到具有多尺度感受野的特征金字塔。

FPN主要有以下优点：

1. 有效地提高了模型的感受野，增强了模型对目标的区分能力。
2. 提高了模型的稳定性和准确性，降低了误检率和漏检率。
3. 对于语义分割任务，FPN可以提高分割边缘的准确性。
FPN是目前深度学习中常用的特征金字塔结构之一，在很多目标检测和语义分割任务中被广泛使用。

**prediction layer是什么**

在深度学习中，prediction layer（预测层）通常是神经网络的最后一层，用于输出模型的预测结果。对于分类任务，预测层通常采用softmax层，用于将神经网络的输出转化为类别概率分布；对于回归任务，预测层通常采用线性层，用于将神经网络的输出转化为具体的数值。

在目标检测模型中，prediction layer通常是指检测头（detection head）的最后一层。检测头是一个独立于主干网络的小型神经网络，用于对特征金字塔中的每个位置和每个尺度的特征进行预测。检测头通常由几个卷积层和全连接层组成，用于预测目标的类别、位置和置信度等信息。预测层的输出通常是一个张量，包含了所有检测结果的类别、位置和置信度等信息。

在目标检测模型中，预测层通常是整个模型最复杂的部分之一，也是最重要的部分之一。预测层的设计直接影响到模型的检测性能，因此需要仔细设计和优化。


**yolact中的prototype 是什么**

在 YOLACT（You Only Look At CoefficienTs）目标检测算法中，"prototype"是指实例分割中的一种表示方式。与传统的实例分割算法通过像素级别的分割掩码来表示每个对象不同，YOLACT使用原型来表示每个对象。

在YOLACT中，每个对象都由一个原型表示，该原型是一组编码器输出的特征图。这些特征图通过一个额外的全卷积层进行处理，得到一组原型掩码。原型掩码是一个二进制掩码，与输入图像的尺寸相同，并且只有与该对象对应的像素为1，其余像素为0。这个过程实现了从特征空间到像素空间的映射，可以更好地捕捉对象的形状和结构。

在YOLACT中，使用原型作为对象的表示具有许多优点，例如减少了分割掩码的存储空间，提高了分割的效率，还可以通过对原型进行插值来生成不同尺寸的分割结果。

**nms是什么**

"NMS"是非极大值抑制（Non-Maximum Suppression）的缩写，是目标检测和计算机视觉中常用的一种技术。

在目标检测中，通常使用边界框（bounding box）来表示检测到的物体位置。由于同一物体可能会被多个边界框检测到，因此需要对这些重叠的边界框进行处理，以避免重复检测。这时候，非极大值抑制就派上用场了。

NMS的工作原理是在重叠的边界框中选择具有最高置信度（confidence）的边界框，然后将与该边界框重叠度较高的其他边界框删除。这个过程不断进行，直到所有边界框的重叠度都被处理完毕。

NMS是目标检测中一个非常重要的步骤，能够有效地提高检测结果的准确性和鲁棒性。同时，NMS的实现方法也有很多种，如基于IoU（Intersection over Union）阈值的方法、基于置信度的方法等。

**Crop是什么意思**

在深度学习中，Crop是指从输入图像或特征图中截取出一个指定大小的区域。Crop通常用于数据增强和网络设计中，其目的是为了增加训练数据的多样性和鲁棒性，同时减少过拟合现象。

在图像分类任务中，Crop一般是指在训练过程中，对原始图像进行随机裁剪。这样可以使得模型对于不同的输入图像的位置和大小变化具有一定的鲁棒性。而在目标检测任务中，Crop通常是指从输入图像中截取出包含目标物体的区域，这样可以将目标物体的信息集中在一起，更有利于模型的学习。

在深度学习中，Crop通常与Resize（调整图像大小）和Padding（填充）等操作配合使用，以便获得一致的输入大小。


**卷积核**

在深度学习中，卷积核（Convolutional Kernel）是一种特殊的滤波器，它可以对输入数据进行卷积操作，从而提取出数据中的特征。在图像处理任务中，卷积核通常用于从图像中提取出不同的特征，例如边缘、角点、纹理等。

卷积核是由一组权重参数组成的矩阵，这些参数会在卷积操作中被卷积到输入数据中，从而得到输出特征图。卷积核的大小和形状可以根据任务的需要进行调整，通常使用的大小为3x3、5x5或7x7等。

卷积核可以通过训练来学习到不同的特征，例如图像中的边缘、纹理、物体等。在训练过程中，模型会不断地调整卷积核的权重参数，从而使得输出特征图更加符合训练数据的特征。

卷积核是卷积神经网络（CNN）的核心组件之一，它在图像处理、语音识别、自然语言处理等领域都有广泛的应用。


**mask_coefficients**

YOLACT是一种基于实例分割的目标检测算法，它在检测物体的同时可以生成物体的分割掩码。在YOLACT中，mask_coefficients是一种特殊的权重参数，它用于计算每个物体的分割掩码。

mask_coefficients是一个向量，它的长度等于掩码分辨率的平方。在YOLACT中，掩码分辨率通常是28x28或14x14等。在生成物体掩码时，mask_coefficients会被重塑成一个矩阵，然后与RoI特征图进行卷积操作，从而得到物体的分割掩码。

在YOLACT的训练过程中，mask_coefficients是通过反向传播算法进行优化的。具体来说，对于每个物体，YOLACT会计算其掩码和ground truth掩码之间的IoU（Intersection over Union），然后使用交叉熵损失函数来最小化它们之间的差异。在反向传播时，mask_coefficients会被调整，从而使得掩码的质量得到提高。

总之，mask_coefficients是YOLACT算法中一个非常重要的参数，它能够帮助模型生成高质量的物体分割掩码，从而提高物体检测和分割的精度。


**prediction_head**

在YOLACT中，Prediction Head是一个由多个卷积层和全连接层组成的神经网络模块，它主要用于预测检测框的位置、类别以及物体的分割掩码等信息。

具体来说，Prediction Head通常会接收一个RoI特征图作为输入，这个RoI特征图是通过ROIAlign操作从特征图中提取出来的。接着，Prediction Head会对RoI特征图进行卷积和全连接操作，从而得到一个包含检测框位置、类别和分割掩码的预测结果。

在预测检测框位置时，Prediction Head通常会使用多个全连接层来输出检测框的坐标和大小等信息。在预测物体类别时，Prediction Head通常会使用softmax激活函数来输出不同类别的概率分布。而在预测分割掩码时，Prediction Head通常会使用一系列的卷积层和反卷积层来对RoI特征图进行解码，从而生成物体的分割掩码。

在YOLACT中，Prediction Head是整个算法的核心组件之一，它能够帮助算法实现高效、准确的目标检测和分割。由于Prediction Head是一个非常复杂的神经网络模块，因此在实现和优化时需要考虑多个因素，例如网络结构、参数初始化、激活函数等。