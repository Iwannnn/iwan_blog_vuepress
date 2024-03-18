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