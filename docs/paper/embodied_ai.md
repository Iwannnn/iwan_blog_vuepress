---
title: 具身、形态
date: 2023-03-18
cover: /images/covers/mygo.png
categories:
 - 文献
tags:
 - 具身智能

---

农历欸，刚好

<!-- more -->


## topic 1



针对设计空间太大这个问题的解决方法

### Embodied intelligence via learning and evolution

- 设计了新的计算框架，使用的异步的方法，新的形态设计空间

动物的智能具身在进化的形态当中

Deep Evolutionary Reinforcement Learning，计算框架、能够进化出不同的智能形态，学习运动和操作任务。

UNIMAL，通用的形态设计空间

算法，训练智能体做tournament based evolution，里面做强化PPO，噶便智能体形态啥的

### RoboGrammar: Graph Grammar for Terrain-Optimized Robot Design

- 设计了新的数据结构，使用文法的方式（类似编译原理里的上下文无关文法这种），引入启发式图搜索（graph heuristic search，能够概括一探索空间知识预测为探索空间），在搜索同时学习一个函数将不完整的设计映射到扩展这些不完整设计后可以达到的最佳值，搜索的方向是最有前途的方向

作者引入一个仿真优化系统，接受用户指定的基本组件，给穿越地形的行为生成一个最优的形态结构和控制器。将机器人用图来表示，引入recursive graph grammar搜索design space。

搜索算法采用了受强化学习启发的基于学习的算法

#### 方法

1. 使用递归图语法来优化机器人结构
2. 每个机器人设计使用MPC-model predictive control评估
3. GHS-graph heuristic search搜索设计空间（由1中语法定义的）来识别有效的机器人和控制器

启发式搜索阶段

1. 设计$\epsilon$贪婪，一定概率随机选择规则，一定概率选择启发式函数得分最高的规则
2. 评估，使用MPC算法评估，计算并存储更新value
3. 学习，根据存储表中的value进行训练

### TRANSFORM2ACT: LEARNING A TRANSFORM-ANDCONTROL POLICY FOR EFFICIENT AGENT DESIGN

- 将transform阶段(skeleton和attribute)和execution阶段结合起来

问题：

1. agent的design space太大了，prohibitively，梯度策略南应用
2. 每个候选设计都需要解决最优控制器，设计昂贵
3. 传统搜索design space使用evolutionry search，sample-inefficient

方法：

将agent的设计过程整合到decision-making过程

1. 先应用一系列变换操作，变化agent的结构和关节属性
2. 在新的形态下应用控制策略
3. 使用基于图的策略处理关节数量的变化
4. 使用梯度策略

transform2act, first design, second control


**transform stage**: 不与环境交互变换形态no env reward

**execution stage**：使用上一阶段设计，电机控制与环境交互获取奖励


### Symmetry-Aware Robot Design with Structured Subgroups

在上一篇的基础，incorporating symmetry searching into the robot design process.




## topic 2

比较普遍的问题，任务与设计是一对一的配对问题，特有的或者通用的

### METAMORPH: LEARNING UNIVERSAL CONTROLLERS WITH TRANSFORMERS

在模块化机器人设计空间（巨大）上使用transformer的方法学习**通用控制器**。

*作者将机器人的形态看作为transformer输出的一种模态*

先前研究的问题：

1. 手动构建结构
2. 低自由度
3. 使用图神经网络，基于机器人的运动学结构是正确的归纳偏置

文章优势：

1. 对未知动力或者结构通用
2. sample-efficient

学习一个单独的应用于海量形态的控制器的难点：

1. 不同的action sapce、传感器输入、形态、动力学2. 在一个模块化设计空间中，并非所有的机器人都同样擅长学习任务，例如，一些机器人可能天生就不那么样本高效

#### 方法

However, the modular nature of the design space implies that while each robot morphology is unique, it is still constructed from the same set of modules and potentially shares subgraphs of the kinematic tree with other morphologies.
尽管形态各异，但是，任由同一组模块组成，可能与其他形态共享子图

1. 对机器人深度优先遍历，获取一个一维的token，token包含机器人的本体感知和形态信息
2. 将token进行线性嵌入，转换为连续的向量表示，并添加学习到的position
3. 将组合而成的向量作为transformer的输入，对其进行编码，捕捉token和上下文（position？）的关系
4. 将transformer的输出和外部感知串联
5. 输入到解码器中获得每个关节的输出即对应的指令


### Modular Robot Design Optimization with Generative Adversarial Networks

模块化机器人，组件可以加加减减，形成定制机器人。充分利用模块话机器人的灵活性flexibility很有挑战性

需要对给定的任务都给出最优的形态，并且在有限的时间和计算下

先前工作使用机器学习，实现以一对一的从任务到设计的映射。

问题：机器人设计通常是多模态的，不同设计可能对同样的任务效果差不多，对于同一个任务多个解是有需求的

文章使用GAN，设计一个任务到设计分布的一对多的map。

传统设计模块机器人形态用的群体的方法比较多，如进化算法，但是性能差，计算昂贵。
近期工作用到了机器学习，面对是否进行过训练的样本任务都能够及时给出结果（zero-shot），但是可能不是最优的。而且呢实际场景需要一个Plan B啥的

作者搞了个算法，结合进化算法（解决方案的质量和多样性）和机器学习（低运行时间成本）

与以往GAN不同没有先验数据，而且对于机器人来说这种先验数据很难收集，作者采用受进化算法启发的在新颖的自引导数据创建过程，在线主动收集数据

- Evolutionary Algorithms：能找到多个解，过于耗时
- Learning-Based Design Automation： 快，部署快，通常方法只会找个单一解
- Generative Models：task to design

### GLSO: Grammar-guided Latent Space Optimization for Sample-efficient Robot Design Automation

通过训练一个变分自动编码器学习design space到连续的latent sapce的映射



## 其他

### Efficient automatic design of robots

问题： 

1. autonomous robots和生物的差距大，以来人的灵感设计，收到劳动、时间、资源限制。
2. 以往设计机器人的方法，无论是模拟（使用进化算法搜索等）还是物理实验，效率都很低。每种方法都会使用梯度下降试错，寻找最优解
3. 确定机器人哪方面问题导致机器人行为的某种低效？并且加以改善是在机器人设计还未解决的

方法：

1. differentiable physical simulators，使用可微分物理模拟器，使得基于梯度的机器人设计成为可能
2. 提出算法，评估fitness，识别缺陷（整体形状、拓扑结构、肢体数量和形状、质量分布、肌肉结构、行为控制），同时改变优化


### Scalable sim-to-real transfer of soft robot designs

模拟到现实的gap，rigid-robot已经要closing了，但是soft还没，并且还wider than rigid

### MY BODY IS A CAGE: THE ROLE OF MORPHOLOGY IN GRAPH-BASED INCOMPATIBLE CONTROL

1. 多认为强化学习局限于兼容（状态空间和动作空间）环境，图神经网络可以处理任大小的graph
2. 消融实验，在图中的形态编码信息并没有提高性能
3. 图结构的好处可能被消息传递的困难所抵消，作者提出基于transformer的方法

### DITTOGYM: LEARNING TO CONTROL SOFT SHAPESHIFTING ROBOTS

启发：生物个体的形态，在其一生中也是不断变化的。可重构机器人

1. 如何模拟reconfiguration robot，如何对其行动进行参数化，连续2d肌肉场下的强化学习问题
2. 传统控制方法不适用与软体机器人，强化学习在非结构化的控制问题表现出色，但是需要更加精细的操作。提出有粗到细的策略
3. 没有标准基础 standard benchmark，提出dittogym，评估在需要动态形态变化的复杂任务中控制可变形软体机器人的控制算法。

### EnvGen: Generating and Adapting Environments via LLMs for Training Embodied Agents

在某个环境下决定如何行动、学习技能（通过玩游戏验证），智能体与环境交互而不是与静态数据交互

别人的方法：

1. 使用LLM学习技能，频繁调用LLM代价高
2. 使用small agent进行强化学习

作者的方法

运用LLM的推理能力创造env，帮助small agent训练，并获得反馈给LLM重新生成环境训练

$
S = exp(\frac{1}{22}\Sigma^{22}_{i=1}ln(1+s_i))-1
$

### Machine learning–driven self-discovery of the robot body morphology

通常机器人形态是已知的，主要使用外部测量设备和数据进行其运动学校准

作者采取了以机器人为中心的视角，探索：机器人能否只依赖少量的先验知识和无组织的本体感知信号自己学习自己的形态了。

利用*传感运动装置的信息结构取决于机器人的具体形态*这个事实条件，作者提出基于互信息的机器人本体感知信号关系表示方法，$\pi$图本体感知信息图，用这个$\pi$图分析构成机器人形态的两种要素：机械拓扑（关节位置）和相应的运动学结构（关节运动方向）

互信息是信息论的一个概念，衡量两个随机变量的关系，在这用于衡量机器人本体感知信号的关系。

**本体感知**于整合各种互补的传感器，例如编码器、陀源螺仪、加速度计和力/扭矩传感器。除了典型的机器人关节位置q、速度q'和关节力矩τ的测量外，使用惯性测量单元（IMUs）来测量机器人身体的加速度v'和角速度ω在状态估计、关节速度和加速度估计、移动机器人控制以及安全的人机交互中都有应用。指的是机器人通过其自身感觉系统感知和理解自身的状态、位置、运动等信息的能力。
过去的学习机器人形态方法依赖于视觉，作者希望用机器人的本体感知去获得机器人的形态表示。使用图论和信息论的方法来寻求本体感知信号之间的关系表示，以便将它们与管理身体形态的物理定律联系起来，从而推断机器人的拓扑结构并描述其运动学特性。

$S = {N,G,A,\lambda,\theta}$

N:运动链中的身体数量
G:描述由机器人的身体所产生的感知运动交互的图形
A:拓扑结构
$\lambda$:运动学描述，通常涉及到描述机器人关节和末端执行器的位置、速度和加速度等参数的过程
$\theta$:链接的惯性参数



#### 机器人形态和信息结构 

机器人的结构确定了其感知和行为能力，并影响了由身体与环境交互产生的感知运动规律。这些规律由信息论来捕捉

:::detail
为了说明实体如何影响信息结构，考虑一个具有一组传感器的假设机器人，如图1A所示。从信息论的角度来看，这些传感器是共享信息的信息源。这些关系的强度在图中以连接传感器的边缘图形表示（浅蓝色边缘）。由于机器人的基础实体结构，传感器之间存在更强的连接（深蓝色边缘）。这些强连接暗示了机器人的身体拓扑结构（图1B），即树状串联运动结构，其中信息在相邻身体的传感器之间交换更加强烈。简而言之，身体结构成为信息共享强度背后的假设。
:::


使用网络拓扑推断Network topology inference发现于可视化拓扑结构（包括相关性、概率图模型、熵、互信息（MI）和转移熵（28））

作者提出了pi图实现-使用网络拓扑推断NTI来研究机器人的本体感知信号之间的功能链接FC。在实体和信息结构存在相互关联的前提下，作者使用pi图展现了机器人的身体拓扑结构是如何编码在其连接性中。

### Multi-environment robotic transitions through adaptive morphogenesis

通常，主要栖息在一个生态位的动物倾向于表现出专门化的体型和步态动力学，从而增加它们在该生态位中的 locomotive 效率，但牺牲了在其他环境中的性能。相反，半水栖和半陆栖动物显示出固有的形态和步态妥协，使它们在两种环境中都只能达到中等效率。

受陆地和水生龟类的启发，作者建造了一个机器人，它将传统的刚性组件和软材料融合在一起，以大幅增加其肢体的形态并转变其步态，以实现多环境运动。步态、肢体形状和环境介质的相互作用揭示了控制机器人运输成本的关键参数。结果表明，自适应形态发生是增强移动机器人在不受约束的、变化的环境中效率的强大方法。

身体包括四个子系统：底盘、外壳、肩关节和变形肢体.

连接到每个肩关节的变形肢体由一对拥有应变限制层的对抗式气动执行器组成，粘附在热固性聚合物上。通过加热这些热固性材料以软化它们，并充气气动执行器，使得肢体的横截面积（增加4倍）和刚度（储存模量增加450倍）发生变化。这些变化使得机器人的肢体能够在利于行走的圆柱形几何形状和利于游泳的扁平鳍状几何形状之间自适应变形。

### Real-world Embodied AI Through a Morphologically Adaptive Quadruped Robot

作者提出了第一个可以在户外、无结构环境中形态适应不同环境条件的四足机器人。

形态适应是通过可变长度的腿来实现的，即大腿和胫骨的长度可以即时调整，以实现不同的行走行为，同时也倾斜中央身体。