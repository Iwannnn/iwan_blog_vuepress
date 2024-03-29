---
title: 中央处理器
date: 2022-07-14
categories:
 - 计算机组成原理
tags:
 - 可恶的408
cover: /images/covers/car.gif
---

在虚构故事当中追求真实感的人脑袋一定有问题

<!-- more -->

## CPU的功能和基本架构

### 功能 

CPU由运算器和控制器组成，**控制器**负责协调并控制计算机各部件执行程序的指令序列包括取指令，分析指令，执行指令；**运算器**的功能是对数据进行加工。

1. **指令控制**，完成取指令，分析指令，执行指令
2. **操作控制**，一条指令的功能往往由若干操作信号组合实现。CPU管理并产生由内存取出的每条指令的操作信号，把各种操作信号送往相应部件，从而控制这些部件按指令的要求进行动作
3. **时间控制**，对各种操作加以时间上的控制，为每条指令按时间顺序提供应有的控制信号
4. **数据加工**，对数据的算术和逻辑运算
5. **中断处理**，对异常和中断进行处理

### 基本结构

**运算器**，接收控制器送来的命令，执行相应的动作，对数据加工和处理。有ALU算术逻辑单元、暂存寄存器、ACC累加寄存器、通用寄存器组、PSW程序状态字寄存器、移位器、CT计数器组成

**控制器**，整个系统的指挥中枢，在控制器的控制下，运算器、存储器和I/O设备功能构成一个有机整体，根据指令要求指挥全机协调工作。基本功能就是执行只能，指令由控制器发出的微操作实现。由硬布线和微程序两种控制器类型。包含PC程序计数器、IR指令寄存器、指令译码器、MAR存储器地址寄存器、MDR存储器数据寄存器、时序系统和微操作信号发生器。

## 指令执行过程

### 指令周期

CPU从主存取出并执行一条指令的时间为指令周期。指令周期由若干机器周期表示，一个机器周期又包含若干时钟周期。存储周期，是指主存储器两次启动操作之间需要的最小时间间隔，也称之为主存储器周期时间。

指令周期包含取指、间指、执行、中断四个周期。每个周期都会访存，但目的不同。取指为了取令，间址为了有效地址、执行为了操作数、中断为了保存断点（当时的控制器里的寄存器的数据）。

### 数据流

访存都是先下修改MAR，通过地址总线传到主存，然后CPU发出读/写命令，然后把数据存入MDR或把MDR数据写入主存。

1. **取指周期**，根据PC内从主存取出指令代码放到IR中，结束+“1”
2. **间址周期**，读有效地址
3. **执行周期**，却操作数然后根据指令干嘛干嘛
4. **中断周期**，将程序断点存入堆栈中，修改SP，利用MAR选地址，写命令，写数据，修改PC。

### 执行方案

1. **单指令周期**，所有指令相同时间
2. **多指令周期**，不同类型不同时间
3. **流水线方案**

## 数据通路

数据在功能部件之间传送的路径称为**数据通路**，包括数据通路上流经的部件。描述了信息从什么地方开始，中间经过了哪些寄存器或多路开关，最终传输到哪个寄存器。

数据通路由控制部件控制，根据每条指令的不同功能，生成对数据通路的控制信号。数据通路的功能是实现CPU内部寄存器与运算器及寄存器之间的数据交互。

1. CPU内部单总线方式
2. CPU内部三总线方式
3. 专用数据通路方式

## 控制器的功能和工作原理

计算机的五大功能部件（控制器、运算器、存储器、输入设备、输出设备），它们由系统总线（数据、地址、控制）连接。

1. 运算器通过数据总线和内存与I/O交换数据
2. IO设备通过**接口**电路与总线相连
3. 内存和IO从地址总线接收地址信息，控制总线得到控制信号，数据总线与其他部件传输数据
4. 控制器从数据总线接收指令信息，从运算部件接收指令转移地址，送出指令地址到地址总线，向系统各个部件提供他们需要的控制信号。

控制器主要功能

1. 取指，给出下一条指令在主存中的位置
2. 对指令译码和测试，产生相应控制信号
3. 指挥并控制CPU，主存，IO之间的数据流动

### 硬布线

#### 接收信号

根据指令的要求，当前时及其内部外部的状态，按时间的顺序发送一系列微操作的控制室信号。由（极其极其极其）复杂的组合逻辑门电路和一些触发器构成又称组合逻辑控制器。

指令的操作码决定控制单元发出不同操作命令（控制信号），为简化控制单元CU的逻辑，将指令的操作码译码和节拍发生器（计时器Timer）分离出来。CU的输入信号来自于经过指令译码器译码产生的指令信息&时序系统产生的机器周期信号和节拍信号（控制单元一定按一定的先后顺序、节奏发出信号）&来自执行单元的回馈即标志。

节拍发生器产生的各机器周期中的节拍信号，使不同的微操作命令按时间先后发出。

还接收控制总线的控制信号比如中断信号或者DMA这些

#### 时序

1. **时钟周期**，用时钟信号控制节拍发生器，产生节拍，使配个减排宽度对应一个时钟周期。在每个节拍内机器可以完成一个或多个需要同时执行的操作
2. **机器周期**，所有指令执行过程中的一个基准时间。不同指令操作不同，指令周期也不同，但是访问一次存储器的时间固定的。通常以访存时间作为基准。在存储自伤的指令字长相等的前提下，取指周期可视为机器周期。
3. **指令周期**。
4. **微操作命令分析**，控制单元具有发出各种操作命令的功能（控制信号）序列的功能，这些命令与指令有关，必须按一定次序发出！

#### CPU控制方式

控制一条指令实际上是依次序执行一个确定的微操作序列。不同指令对应微操作数和复杂程度不同，执行时间也不同。

1. **同步控制方式**，系统与偶一个统一的时钟，控制信号都来自这个时钟信号。以最长最烦的微操作为标准。采取完全统一的，具有相同时间间隔的相同数目的节拍作为机器周期。简单但慢
2. **异步控制方式**，不存在基准时标信号，按固有速度工作。快但复杂
3. **联合控制方式**，介于同步异步之间，大部分同步小部分异步。

#### 设计步骤

1. 列出微操作命令操作的时间表。包括时间周期、节拍下每条指令完成的微操作控制信号。
2. 对微操作信号进行综合。

*微操作控制型号=机器周期 & 节拍 & 脉冲 & 操作码 & 机器状态条件*

3. 画出微操作命令的逻辑图。总不至于靠这个吧。

### 微程序

微程序控制器采用存储逻辑实现，将微操作信号代码化，将每条机器指令转化为一段微程序，存入一控制存储器，微操作控制性由微指产生。

#### 基本概念

::: tip
设计思想就是把每条机器指令写成一个微程序，每个微程序包含若干微指令，每条微指令对应一个或几位微操作命令。
:::

1. 微命令和微操作。一条机器指令可以分解为一个微操作序列，微操作使计算机中最基本的、**不可再分解**的操作。在微程序计算机中由控制部件向执行部件发出的各种控制命令就是微命令，它是构成控制序列的最小单位。微操作和微命令一一对应，微命令是微操作的控制信号，微操作使微命令的执行过程。
2. 微指令和微周期。微指令使若干微命令的集合。用来存放微指令的控制存储器的单元地址称为微地址。微指令包含两部分，操作和地址。微操作码，字段用于产生下一步操作需要的各种操作控制信号，微操作码，用于控制下一条要执行的微指令地址。
3. 主存和控制存储器，控制存储器存放微程序，ROM
4. 程序与微程序，程序时有序的指令的集合，用于完成特定功能；微程序使微指令的有序集合，一条指令的功能由一段微程序实现

:::tip
一条指令（机器）使微指令的有序序列（也就是一个微程序），一条微指令是微命令（控制部件向执行部件发出的控制信号）的有序序列，一个微命令对应一个微操作（执行部件接收到控制命令的所执行的操作）。
:::

#### 基本组成

1. 控制存储器，存放各指令对应微程序，ROM
2. 微指令寄存器，存放从CM中取出的微指令，位数与指令字长相同
3. 微地址形成部件，用于产生初始微地址和后继微地址，保证连续
4. 微地址寄存器，接收微地址形成部件送来的微地址

#### 工作过程

在微程序控制下计算机执行指令的过程。

1. 执行取微指令公共操作。在机器开始运行时，自动将**取值微程序**入口送入CMAR，从CM中读出相应的微指令送入CMDR。入口地址一般为CM的0号单元，当取值为程序执行完成后，从主存中取出的机器指令已经存入指令寄存器中辣
2. 由机器指令的操作码字段通过微地址形成部件产生该机器指令所对应的微程序入口地址，并送入CMAR 
3. CM中逐条取出对应的微指令并执行
4. 执行完对应一条机器指令的一个微程序后，又回去取指位程序的入口地址。继续1

#### 编码方式

微指令的编码方式又称微指令的控制方式。目标是保证速度下缩短字长

1. 直接编码，无需译码，每一位都代表一个微命令，n个微命令操作字段就要n位。
2. 字段直接编码，操作码分为若干字段，互斥的指令放在同一个字段，相容的指令放在不同的字段，每个字段独立编码。每个字段留出一个状态，不发出命令。要译码器
3. 字段间接编码，一个字段的某些微命令需要另一个字段的微命令解释，不是直接译码。

#### 地址形成

1. 直接由微指令的下地址给出。微指令格式中设置一个下地址字段，有称断定方式
2. 根据机器指令的操作码形成，机器指令到IR后，微指令的地址由操作码经微地址形成部件形成
3. 增量计数器法，+1+1，连续情况
4. 各种标志决定转移
5. 测试网络形成
6. 硬件直接产生

#### 微指令格式

1. 水平型微指令，从编码方式看直接，字段直接，字段间接，混合都属于水平型。指令字中的一位对应一个控制型号，有输出位1无输出为0。一条指令可以发出好几个微命令，定义并行操作。
2. 垂直型微指令，类似机器指令操作码方式，一条指令只能定义并执行一条基本操作
3. 混合型微指令，垂直基础上加一些不复杂的水平

#### 设计步骤

1. 写出对应的为操作命令和节拍安排，与硬布线不同，要将指令的操作码送入微地址形成部件，已形成该条机器指令的微程序首地址。
2. 确定微指令格式，包括编码方式，后继地址形成方式，指令字长这些
3. 编写微指令码点，根据操作控制字段美味代表的微操作命令

#### 动态微程序

可编程的微程序，EPROM

#### 毫微程序

:::danger
禁止套娃
:::

硬件不是由微程序直接控制，由第二级控制存储器的毫微解释。

## 异常和中断

- **异常**，CPU内部发生的意外，也叫内中断。
- **中断**，CPU外部向CPU发出的中断请求，通常用于信息的输入输出，也称外中断。

### 异常分类

分为硬故障中中断（存储器校验错，总线错误）和程序性异常（软件中断，除0、溢出、断点、单步跟踪、非法指令、栈溢出、地址越界、缺页）。

按返回方式分为：

1. **故障Fault**，指令启动后，执行结束前被检测到的异常，有的经处理可以回去执行，有的无法处理，得终止。
2. **子陷Trap**，又称陷阱或陷入，预先安排的一种“异常”（假装异常，实则正常），设置断点什么的。
3. **终止Abort**，发生了让计算机无法继续执行的硬件故障。控制器出错，校验器出错什么的，

终止异常和外中断属于硬件中断。

### 中断分类

下一章。

## 流水线

### 基本概念

- 时间并行性，将一个任务分解为几个不同的阶段，每个阶段在不同的功能部件上并行执行，以便同一时刻能够执行多个任务
- 空间并行性，在一个处理及内设置多个执行相同任务的功能部件，这些功能部件并行工作，称为超标量处理机（超过标准数量？

#### 指令流水线的定义

一条指令的执行过程分解为若干阶段，每个阶段由相应的功能部件完成。如果将各阶段视为流水段，则指令的执行过程构成一条指令流水线

1. Instruction Fetch 取指，从IR或Cache取指令
2. Instruction Decode 译码/读寄存器，操作控制器对指令进行译码，同时从寄存器堆中取操作数
3. Execute 执行/计算地址，执行运算操作或计算地址
4. Memory Access 访存，对存储器进行读写操作
5. Write Back 写回，将指令执行结果写回寄存器堆

指令周期数CPI，每个时钟周期都有一条指令进入流水线，都有一个指令完成。

流水段个数以最为复杂的指令所用的功能段个数为准

流水段长度以最为复杂的操作所花的时间为准

指令集需要的特征：

1. 指令长度尽量一致，利于简化去指和译码
2. 指令格式尽量规整，尽量保证源寄存器的位置相同，有利于在不知道指令是就去寄存器操作数
3. 采用Load/Store指令，其他指令不能访问内存，可以把Load/Store指令的计算和运算指令的执行步骤规整在一个周期内
4. 对齐

### 实现

#### 数据通路

- IF段，PC、指令存储器、下指地址的计算逻辑，流水寄存器锁指令字、PC+“1”
- ID段，操作控制器、去操作数逻辑、立即数符号扩展模块，流水锁寄存器堆中的取出的RS、RD、写寄存器编号#、PC、立即数扩展
- EX段，ALU、分支地址计算模块，流水锁ALU结果、带写入数据、写寄存器编号#
- MEM段，数据存储器读写模块，流水锁ALU结果、数据存储器读出数据、写寄存器编号#
- WB段，寄存器写入控制模块

每个流水段要加一个流水寄存器。

采用统一的时钟CLK进行同步，每来一个新的时钟就会有一条新的指令进入流水线IF段。同时流水线寄存器会锁存前段加工处理完成的数据和控制信号，为下一个段的功能部件为数据输入。

#### 控制信号

没图
详细的看书吧太不好说了。

#### 执行过程

所有流水段都要完成，没有事干就等

1. IF，根据PC去指，PC+“1”，送入PC输入端
2. ID，生成后续所需要的控制信号。
3. EX，根据具体指令执行
4. MEM，根据具体指令执行
5. WB，根据具体指令写不写，写到哪

### 流水线的冒险和处理

1. **结构冒险**

多条指令再同一时刻争用同一资源而形成冲突，资源冲突

解决方法

- 前一条访存后一条暂停一周期
- 单独设置数据寄存器和指令寄存器

2. **数据冒险**
下一条指令用到当前指令的内容

- **写后读**，当前指令写入数据到寄存器，下一条指令才能读，若是先读后写，那么下一条读到的是旧数据
- **读后写**，当前指令读出数据后，下一条指令才能写，如是先写后读，独到的就是新的数据
- **写后写**，当前指令写入数据到寄存器，下一条指令才能写，否则寄存器的值就不新了

解决方法：

- 遇到数据相关指令，暂停一个至几个周期
- 设置相关专门通路，不等前一条写回寄存器组，下一条也不读寄存器组，直接把前一条ALU计算结果作为自己的输入，**数据旁路技术**
- 通过编译器优化

3. **控制冒险**

指令通常顺序执行，但跳转之类的会改变PC值，会造成断流

解决办法：

- 分支预测，尽早生成转移目标地址，静态，预测条件不满足就继续执行；动态，根据程序历史执行情况，动态预测
- 预取转移成功不成功的两个控制流方向上的目标指令
- 加快和提前形成条件码
- 提高转移方向的猜准了

### 性能指标

1. 吞吐率

$n$为任务数、$T_k$为处理$n$个任务总时间。$k$为流水线段数，$\Delta{t}$为时钟周期数

$TP=\frac{n}{T_k}=\frac{n}{(k+n-1)\Delta{t}}$

2. 加速比

$S=\frac{T_0}{T_k}=\frac{kn\Delta{t}}{(k+n-1)\Delta{t}}=\frac{kn}{(k+n-1)}$


### 高级流水线技术

1. 超标量流水线技术，动态多发射技术，每个周期可以并发多个独立指令
2. 超长指令字技术，静态多发射技术，挖掘指令潜在并行性
3. 超流水线，流水段分段


## 多处理器的基本概念

SISD SIMD MISD（×） MIMD

硬件多线程，细粒度、粗粒度、同时多线程

多核处理器

共享内存多处理器