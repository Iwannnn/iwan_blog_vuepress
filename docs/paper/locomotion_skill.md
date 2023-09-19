---
title: 四足机器人
date: 2023-09-11
cover: /images/covers/soyo.jpg
categories:
 - 文献
tags:
 - AI
 - 机器人

---

<!-- more -->


## abstract

- motor 运动
- qualitative 定性的
- quantitative 定量的
- saliency 显著的
- predate 早于
- replicas 复制品

机器人能通过强化学习学习到运动技能，使用神经网络反映状态和行动映射。

**状态选择很关键**，神经网络复杂，需要人类的洞察力和工程师的努力通过定性方法来选择状态，而不用定量分析状态重要性

使用强化学习。找到most essential feedback states

simulated quadruped robot 四足机器人。

仅用学习关键部位就能做出很多姿势，与学习更多部位的机器人相媲美

机器人形态与生物类似，提供研究条件（指导控制实验，生成定量数据分析）

机器人的动作可以控制策略的学习反馈，**选择反馈重要**。某些状态在真实环境下不像模拟环境下方便测量，状态测量受不确定性和错误影响，性能也会受到不确定性影响。

强化学习和深度神经网络对于学运动姿势有用

现在还无法确定不同反馈的相对重要性，哪种状态观察最有效。需要人类洞察和工程努力在机器人学习中凭借经验选择合适的反馈

现在选择的反馈状态还是依据经验而定的，缺乏系统的方法

- gait 步态


## biological insights and motivation

生物学角度，好多好多感官从运动与周围环境反馈信息。冗余信息保证了动作控制的鲁棒性。

为学习来自不同感知器官的感觉信息的重要性，采取了病变研究和消融学习方法。在小动物上做这些实验又要道德限制，选择性刺激或除去不同的接收器。

四足机器人与小狗有相似的感知结构，使用形态学提供了研究运动机会

## Relative work

消融实验常用于学习单个反馈的重要性，（消去一个看看效果变化从而看看这个反馈的重要性），但只有单个，不能看到信号和整个感觉反馈系统的相关性

定量地用不同步长i叫特定反馈重要性的尝试也很有限。

**不同感官反馈之间的关系对机器人学习姿势至关重要，但现在还缺少方法**

论文打算研究的问题

> What is the relative importance of different sensory feedback signals for a given motor task and various quadrupedal gaits? Which sensory feedback signals are essential, necessary and sufficient for learning quadrupedal locomotion? Which redundant feedback is beneficial to have but not entirely necessary?

### contribution

提供了一个系统的方法量化对四足机器人学习动作时不同反馈的相关重要性。

神经网络学习状态-行为映射，对反馈评级rank,找一系列基本的对四足机器人重要的反馈

高效学习新动作，使用key states

辨别出关键少数的反馈是机器人学习最少地以来感觉