---
title: 进化算法&深度学习
date: 2023-12-23
cover: /images/covers/mygo.png
categories:
 - 文献
tags:
 - 进化算法
 - 深度学习

---

农历欸，刚好

<!-- more -->


## Analog circuit sizing based on Evolutionary Algorithms and deep learning

### abstract

将深度神经网络与进化算法结合进模拟集成电路尺寸自动化（各个元器件尺寸设计）

Firstly, we use EA and numerical performance evaluation to increase efficiency and produce highly accurate results for global optimization. Secondly, we incorporate a local search to enhance the performance of global optimization, with DNN models being used to evaluate the performance of analog circuits during this phase. Lastly, we employ DNN model evaluations instead of numerical performance evaluation for ranking candidate designs, which significantly speeds up the local minimum search.

1. EA和数值性能评估，高精确度的全局优化结果
2. 局部搜索，DNN预测性能
3. DNN评估并排名

相较于SPICE仿真提升了很多倍

### related work
现有的方法总结

(i) 优化算法与SPICE仿真器的结合可以产生准确的优化结果。
(ii) 顺序仿真为基础的局部最小值搜索可以改善全局优化结果，但可能导致更长的处理时间。
(iii) 经过良好训练的神经网络模型和替代模型可以提高处理速

### method

方法流程：
1. 随机生成解集，使用SPICE仿真器进行评估，形成训练集。
2. 训练DNN
3. 每次迭代，EA搞新，**使用DNN评估创新，与父母比较（是否犹豫上一代），优则纳入下一代**
4. 在最优数据上再次训练