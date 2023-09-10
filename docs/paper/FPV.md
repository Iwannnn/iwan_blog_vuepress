---
title:  AI FPV 战胜人类
date: 2023-09-10
cover: /images/covers/soyo.jpg
categories:
 - 论文
tags:
 - AI
 - 无人机


# sticky: true
---

<!-- more -->

# 竞速无人机
FPV无人机竞速比赛，飞行员从飞机上的相机看周围环境。达到专业水平很有挑战性。**Swift**，强化学习，和3个人类世界冠军比赛，赢下比赛，这可能会激发起他无力系统中，基于混合学习的部署方案。

Deep RL(reinforcement learning)深度强化学习👍，复杂竞技性比赛表现好于人类。

- demonstrations 演示

FPV飞巨快，飞行员远程控制。 2016智能FPV初次登场，2019阿尔法Pilot展现实力，最近快接近职业选手了，但是馁，这些设备获得了近乎完美状态评估来自于外部动捕系统，而人类选手只能从无人机上的相机看环境

- the first two team 前两支队伍
- take almost twice as long as 几乎两倍于

Swift可以在quadrtor（四旋翼飞行器）用onboard sensor与人类世界冠军级别选手比拼。

1. perception system，高维数据转低维
2. control policy 将低维数据转换为指令

control policy 

- discrepancy 差异
- feedforward neural network 前馈神经网络
- model-free on-policy deep RL 无模型策略
- non-parametric empirical noise model 非参数经验噪声模型

 Swift战三冠军

- head-to-head 肉搏战
- back-to-back 背靠背 连续

## Swift系统

基于学习和传统算法结合，实现传感器到命令的映射。

1. observation policy 观察策略，将高维视觉和惯性系信息提取到特定任务的低维编码中
2. control policy，编码变指令，给无人机

- schematic 大概的
- global pose 全局姿态
- perception 视感控制器


*detect gate*，惯性传感器，gate检测器，卷积神经网络处理图像，从而估计无人机的全局位置和方向。*camera-resectioning algorithm*

控制策略，将K过滤器映射到飞行器指令， 以无模型策略强化学习，训练期间，最大化了奖励，保持下一个gate在camera中














