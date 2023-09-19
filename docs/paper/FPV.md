---
title:  AI FPV 战胜人类
date: 2023-09-10
cover: /images/covers/soyo.jpg
categories:
 - 文献
tags:
 - AI
 - 无人机

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

控制策略，将K过滤器映射到飞行器指令， 以**无模型策略强化学习**，训练期间，最大化了奖励，保持下一个gate在camera中

- discrepancy 差异
- intricacy 错综复杂
- residual 剩余的
- ablate 消融

1. 模拟与现实动态的差异
2. 噪声估计
带来的simulation和reality的差异
通过收集少量的real world data,用这些data增强模拟器的真实性，减少模拟与现实的差距，来避免poor performance on physcial hardware

动捕系统+机载传感器的数据来控制无人机姿态，识别错误。感知残差（随即）与动态残差（确定）使用不同的方式建模，将这些建模作为微调加入racing policy，

对比了别人的，理想化条件下好，现实不如，噪声十分敏感

## Results

- provided 前提
- trajectories 轨迹
- time trial 计时赛
- left to the discretion of xxx 有xxx自行决定
- mean and variance 均值和方差

Swift在比赛里很牛逼，创纪录。整体比人类飞行员快，但并不是每阶段都是最快。起步快，转弯好

无模型强化学习能够通过价值函数优化长期奖励，优化时间长，人类采取决定的时间短（到下一个gate），swift整体性更好

人类能更早将飞行器对准下一个gate，猜测，*人类更习惯于面对下一个gate，swift有其他传感器*

swift狂冲，人类不一定，能采取更多策略，降低风险，swift不一定会注意对手


## Discussion

- akin to 相似
- vestibular system 前庭系统

FPV竞赛需要在噪声与不完全的传感器输入数据中进行实时决策，我们做的系统多次达到并超越人类冠军水平，有以下几点优势

1. inertial data 使用了惯性数据，
2. lower sensorimotor latency，反应？
3. 高刷 30hz vs 120hz

人类飞行员！crash了如果硬件还好继续跑，但swift不行。适应环境能力强

使用gate detector和 residual observation model 提升适应环境的能力






