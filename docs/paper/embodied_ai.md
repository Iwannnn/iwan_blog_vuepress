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

## Embodied intelligence via learning and evolution

动物的智能具身在进化的形态当中

Deep Evolutionary Reinforcement Learning，计算框架、能够进化出不同的智能形态，学习运动和操作任务。

UNIMAL，通用的形态设计空间

算法，训练智能体做tournament based evolution，里面做强化PPO，噶便智能体形态啥的

## METAMORPH: LEARNING UNIVERSAL CONTROLLERS WITH TRANSFORMERS

MetaMorph，基于transformer的，在模块化机器人设计空间上学习通用控制器。

传统机器人设计方法'one robot one task'，如何利用大规模预训练的优势应用到机器人领域？

先前研究的问题：

1. 手动构建结构
2. 低自由度
3. 使用图神经网络，基于机器人的运动学结构是正确的归纳偏置

文章优势：

1. 对未知动力或者结构通用
2. sample-efficient

学习一个单独的应用于海量形态的控制器的难点：

1. 不同的action sapce、传感器输入、形态、动力学
2. 在一个模块化设计空间中，并非所有的机器人都同样擅长学习任务，例如，一些机器人可能天生就不那么样本高效

## TRANSFORM2ACT: LEARNING A TRANSFORM-ANDCONTROL POLICY FOR EFFICIENT AGENT DESIGN

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

**transform stage**: 不与环境交互变换形态

**execution stage**：使用上一阶段设计，电机控制与环境交互获取奖励

## Symmetry-Aware Robot Design with Structured Subgroups

在上一篇的基础，incorporating symmetry searching into the robot design process.

## Efficient automatic design of robots

问题： 

1. autonomous robots和生物的差距大，以来人的灵感设计，收到劳动、时间、资源限制。
2. 以往设计机器人的方法，无论是模拟（使用进化算法搜索等）还是物理实验，效率都很低。每种方法都会使用梯度下降试错，寻找最优解
3. 确定机器人哪方面问题导致机器人行为的某种低效？并且加以改善是在机器人设计还未解决的

方法：

1. differentiable physical simulators，使用可微分物理模拟器，使得基于梯度的机器人设计成为可能
2. 提出算法，评估fitness，识别缺陷（整体形状、拓扑结构、肢体数量和形状、质量分布、肌肉结构、行为控制），同时改变优化


## Scalable sim-to-real transfer of soft robot designs

模拟到现实的gap，rigid-robot已经要closing了，但是soft还没，并且还wider than rigid

## RoboGrammar: Graph Grammar for Terrain-Optimized Robot Design

问题还是，机器人的design sapce又vast又intractable，要设计新的数据结构来搜索与优化。同时需要emergence of imaginative甚至invention solutions

作者引入一个仿真优化系统，接受用户指定的基本组件，给穿越地形的行为生成一个最优的形态结构和控制器。将机器人用图来表示，引入recursive graph grammar搜索design space。

搜索算法采用了受强化学习启发的基于学习的算法

## Modular Robot Design Optimization with Generative Adversarial Networks

模块化机器人，组件可以加加减减，形成定制机器人。充分利用模块话机器人的灵活性flexibility很有挑战性

需要对给定的任务都给出最优的形态，并且在有限的时间和计算下

先前工作使用机器学习，实现以一对一的从任务到设计的映射。

问题：机器人设计通常是多模态的，不同设计可能对同样的任务效果差不多，对于同一个任务多个解是有需求的

文章使用GAN，设计一个任务到设计分布的一对多的map。

传统设计模块机器人形态用的群体的方法比较多，如进化算法，但是性能差，计算昂贵。
近期工作用到了机器学习，面对是否进行过训练的样本任务都能够及时给出结果（zero-shot），但是可能不是最优的。而且呢实际场景需要一个Plan B啥的