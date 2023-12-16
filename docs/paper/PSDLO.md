---
title: 基于物理监督的深度学习优化（PSDLO）
date: 2023-09-18
cover: /images/covers/bc.gif
categories:
 - 文献
tags:
 - AI
 - 深度学习

---

第一篇要汇报的论文

<!-- more -->
## keywords

physics-supervise | deep learning | evolutionary algorithm | accuracy | efficiency

## introduction

优化算法一直追求效率和准确性

传统上都是使用进化算法和深度学习结合方式，但是cannot achieve the desired optimization

提出了PSDLO-physics-supervised deep-learning optimization algorithm 物理监督深度学习优化算法，介入进化过程，同时实现了**准确性和效率**，并在充分与不充分的数据集上成功应用

> [优化问题](https://zh.wikipedia.org/zh-cn/%E6%9C%80%E4%BD%B3%E5%8C%96%E5%95%8F%E9%A1%8C#:~:text=%E4%BC%98%E5%8C%96%E9%97%AE%E9%A2%98%EF%BC%88%E8%8B%B1%E8%AF%AD%EF%BC%9AOptimization%20problem,%E4%BC%98%E5%8C%96%E9%97%AE%E9%A2%98%E4%B8%8E%E7%BB%84%E5%90%88%E4%BC%98%E5%8C%96%E3%80%82)（英语：Optimization problem）在数学与计算机科学领域中，是从所有可行解中查找最优良的解的问题。根据变量是连续的或离散的，优化问题可分为两类：连续优化问题与组合优化。


> [进化算法](https://zh.wikipedia.org/zh-cn/%E8%BF%9B%E5%8C%96%E7%AE%97%E6%B3%95#:~:text=%E8%BF%9B%E5%8C%96%E7%AE%97%E6%B3%95%EF%BC%88%E8%8B%B1%E8%AF%AD%EF%BC%9AEvolutionary%20algorithm,%E5%81%9A%E6%BC%94%E5%8C%96%E8%AE%A1%E7%AE%97%E7%9A%84%E7%AE%97%E6%B3%95%E3%80%82)英语：Evolutionary algorithm）是人工智能中进化计算的子集。进化算法启发自生物的演化机制，模拟繁殖、突变、遗传重组、自然选择等演化过程，对优化问题的候选解做演化计算的算法。

1. genetic algorithm GA，遗传算法，遗传算法通常实现方式为一种计算机模拟。对于一个最优化问题，一定数量的候选解（称为个体）可抽象表示为染色体，使种群向更好的解进化。传统上，解用二进制表示（即0和1的串），但也可以用其他表示方法。进化从完全随机个体的种群开始，之后一代一代发生。在每一代中评价整个种群的适应度，从当前种群中随机地选择多个个体（基于它们的适应度），通过自然选择和突变产生新的生命种群，该种群在算法的下一次迭代中成为当前种群。
2. particle swarm optimization PSO，粒子群优化，PSO 算法最初是为了图形化地模拟鸟群优美而不可预测的运动。而通过对动物社会行为的观察，发现在群体中对信息的社会共享提供一个演化的优势，并以此作为开发算法的基础[1]。通过加入近邻的速度匹配、并考虑了多维搜索和根据距离的加速，形成了 PSO 的最初版本。
3. ant colony optimization ACO，蚁群算法，是一种用来在图中寻找优化路径的机率型算法

进化算法的问题，适度性函数在每次迭代中都要被计算，来评估进化状态，根据问题的性质，采取一些*基于物理的控制方程(physics-based governing equations)*来实现。**time-comsuming,slow convergence,even though accurate**。

使用*基于深度学习的神经网络(deep learning-based neural network)*来代替*基于物理的控制方程(physics-based governing equations)*，来解决基于物理的求解方法的效率问题。NN在特定问题的预测上上已经被证明了高效与准确性，引发能否NN能否替代基于物理模拟的讨论。

但是捏，与单个预期问题不同，基于进化算法的优化问题与神经网络方法相结合涉及很多迭代步骤，因此需要多次执行神经网络计算，其中某些特定的因素会被放大/减小和继承。

关键问题：**Can a well-trained deep learning-based NN method that has been tested successfully for single-problem prediction maintain its accuracy and be harnessed when applied to an evolutionary optimization method to achieve simultaneous efficiency and accuracy？**一个训练有素，在单个问题预测上成功检测的基于深度学习的神经网络，能否在应用到于进化优化方法时保持准确度与效率

为了纠正简单结合进化算法和神经网络来带来不准确问题，开发了为实现高效准确的物理监督深度学习算法PSDLO。

PSDLO中，物理学不仅为神经网络模型提供数据，还对每个迭代进行监督。

量化比较PSDLO和结合进化方法的无物理监督的NN，PSDLO能够适当辨别与处理错误的数据与特征

## result

### 问题陈述

FigA:EM，EM+DL，PSDLO在准确度和速度上的比较，提供三个样例，固体力学（最佳弹簧结构设计的双稳态结构）、声学（声屏障性能优化）、固态物理学（应变工程实现压电耦合系数最大化）

深度学习方法采取NN，全连接神经网络，输入层通过提取其特征（例如几何和物理参数）与物理模型进行通信然后，隐藏层捕捉输入特征之间的复杂关系和相互作用，而输出层，同时也是进化算法的适应度函数，反映了这个物理问题的结果。

进化算法采取遗传算法GA举例，GA是一种基于自然选择和遗传原理的优化方法

### Deep Learning–Based Evolutionary Method without Physics Supervision

todo

## 概括

优化算法，需要计算fitness function，追去accuracy和efficiency

将深度学习与优化算法结合，计算fitness function，提升速度，但是牺牲了准确性

作者提出子啊优化算法每次迭代中，假如物理监督，

