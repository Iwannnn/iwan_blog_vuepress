---
title: 囵囵囵
date: 2023-05-24
cover: /images/covers/gogo.jpg
categories:
 - 文献
tags:
 - 具身智能
 - 强化学习
---

<!-- more -->

## A Grasp Pose is All You Need: Learning Multi-fingered Grasping with Deep Reinforcement Learning from Vision and Touch

这名字多少有点那个了

多指机器人手有潜力使机器人执行复杂的操作任务,由于状态和动作空间的高维性，教机器人用拟人化的手抓取物体是一个艰巨的问题

对于这种高维问题，环境探索是不可行的，从而阻碍了策略优化的初始阶段 ---- 自动收集任务演示以初始化策略的训练。所提出的抓取流程从外部算法生成的抓取姿态开始，用于启动动作。然后，使用（先前通过G-PAYN训练的）控制策略来接近并抓取物体

## Scalable Deep Reinforcement Learning for Vision-Based Robotic Manipulation

可扩展强化学习方法学习基于视觉的动态操作技能的问题，谷歌利用很多真实机械臂去收集数据训练的，当然也包含虚拟物理引擎里的机器人，结果是96%的准确率，其思想大致沿用了上面那篇的DQL的思路。也是用on-policy与off-policy混合的方式训练的

先进行收集数据利用off-policy进行训练得到一个还可以的模型将其用于on-policy，然后利用on-policy训练，on-policy训练过程收集到的所有数据都存储在磁盘上，全部结束后利用off-policy离线训练全部数据。

回放缓冲区通常是一个队列或者循环缓冲区，用来存储过去的状态、动作、奖励和下一个状态的元组，即(s,a,r,s')。这些元组是智能体与环境交互得到的数据。智能体在每一步与环境交互时，将这些数据添加到回放缓冲区中

## Reinforcement and Imitation Learning for Diverse Visuomotor Skills

利用虚拟机械臂收集一些专家数据，然后将这些数据作为模仿学习的样本，策略网络的输入除了视觉部分还有机械臂的一些状态特征，比如关节角度，角速度等。价值网络的输入仅仅机械臂的特征和当前目标物的3D状态特征，而不是直接利用CNN图像信息，这样更有利于价值网络学习。

## Deep Dynamics Models for Learning Dexterous Manipulation

具备灵活多指手的机器人可以灵活执行各种操纵技能。然而，许多更复杂的行为也因难以控制而臭名昭著。

model base的方案，用于控制类人手操作物体，专注于复杂行为，而不是特征方向。

## Multi-Task Reinforcement Learning with Soft Modularization

多任务强化学习，参数共享部分，避免梯度干扰。作者引入模块化技术，对策略进行模块化表示，添加路由策略、用不同的路由策略，配置基础网络以适应每个任务。

## SHARING KNOWLEDGE IN MULTI-TASK DEEP REINFORCEMENT LEARNING

假设：从具有共同特性的不同任务中学习，有助于泛化这些任务的知识，从而比学习单个任务更有效地提取特征

证明了所得到的特征集在被强化学习使用时能提供的优势

## Multi-Task Reinforcement Learning With Attention-Based Mixture of Experts

多任务强化学习，使用混合专家，改进门控网络使用attention机制