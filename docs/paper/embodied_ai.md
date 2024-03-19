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