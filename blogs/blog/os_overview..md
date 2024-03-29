---
title: 操作系统概述
date: 2022-07-26
categories:
 - 操作系统
tags: 
 - 可恶的408
cover: /images/covers/cat.png
---

408一轮差不多复习完了，但还是忘了很多

<!-- more -->

## 操作系统基本概念

操作系统管理和调配资源什么什么的

### 特征

1. 并发，注意与并行的区别，时间间隔与时刻
2. 共享，互斥共享和同时共享
3. 虚拟，一个物理设备逻辑上变成多台设备
4. 异步，多道程序环境下多个程序并发执行

### 目标和功能

#### 系统资源的管理者

处理机管理、存储器管理、设备管理和文件管理（后面几章）

#### 用户与计算机硬件系统之间的接口

命令接口，联机（交互式命令，输一条执行一条、分时或实时系统）&脱机（执行脚本类似、批处理系统）

程序接口，由一组系统调用（广义指令）组成，用户使用系统调用请求操作系统为其提供服务。

#### 对系统资源的扩充

## 发展历程

### 手工

都要人工干预

### 单道批处理系统

内存中时钟一道作业，为解决人际矛盾和CPU与IO设备不匹配的矛盾产生

1. 自动性
2. 顺序性
3. 单道性

### 多道批处理系统

允许多个程序同时进入内存，在CPU种*交替*执行

1. 多道
2. 宏观并行
3. 微观串行

资源问题

1. 如何分配处理器（二章）
2. 多道程序内存分配（三章）
3. IO分配（五章）
4. 组织和存放程序和数据，以方便用户且保证安全性和一致性（四章）

### 分时操作系统

把处理器运行时间分为时间片，按时间片轮流把处理器分配给各联机作业

1. 同时性（多路性）
2. 交互性
3. 独立性
4. 及时性

### 实时操作系统

软&硬

1. 及时性
2. 可靠性


### 网络操作系统和分布式计算机系统

### 个人计算机操作系统


## 操作系统运行环境

### 处理器运行模式

1. 内核程序
2. 用户自编程序（应用程序）

1是2的管理者，要执行一些特权指令

1. 特权指令，不允许用户直接使用的指令，如IO、置中断、存取内存保护寄存器、送程序状态字
2. 非特权指令，允许用户直接使用的指令，不能直接访问软硬件资源（都得操作系统来），仅限于访问用户的地址空间，防止用户程序对系统造成破坏

CPU运行模式分为用户态（目态）和核心态（管态，内核态），由硬件紧密关联的模块（时钟管理、中断处理、设备驱动最底层）和运行频率较高的（进程管理、存储器管理和设备管理）构成操作系统的内核。

**内核有什么**

1. 时钟管理
2. 中断机制
3. 原语
4. 系统控制的数据结构及出来

### 中断和异常

如何在内核态和用户态切换。内核态要建立“门”让处于用户态的用户访问，这个“门”就是中断和异常

#### 定义

中断Interruption，外中断，指CPU执行指令外部的事件。

异常Exception，内中断，CPU执行指令内部的事件。

#### 分类

外中断，可屏蔽中断INTR线，不可屏蔽中断NMI线

异常，故障Fault（执行指令引起的异常）、自陷Trap（事先安排）、终止Abort（CPU无法继续执行的硬件故障）

#### 处理过程

指令周期，内外不同周期

### 系统调用

用户在程序中调用操作系统提供的子功能（公共子程序）。系统中各共享资源都由操作系统同一管理，用户程序用到资源要通过系统调用的方式向操作系统提出请求。

1. 设备管理
2. 文件管理
3. 进程控制
4. 进程通信
5. 内存管理

涉及资源管理，必定用到特权指令，所以系统调用处理需要操作系统处于内核态执行，用户程序可以执行陷入指令（访管指令或trap指令）发情系统调用，请求操作系统提供服务。


## 操作系统结构

1. 分层法
2. 模块法
3. 宏内核
4. 微内核
5. 外核心

## 操作系统引导

1. 激活CPU，读取ROM中的boot程序，将指令寄存器设为BIOS的第一条指令，开始执行BIOS指令
2. 硬件自检
3. 加载带有操作系统的硬盘
4. 加载主引导记录MBR，硬盘以特定的标识符区分引导硬盘和非引导硬盘，MBR高速CPU到哪个硬盘找操作系统
5. 扫描硬盘分区表，加载硬盘活动分区，MBR包含硬盘分区表，区分活动分区和非活动分区，找到活动分区加载并将控制权交给活动分区
6. 加载分区引导记录PBR，分区第一个扇区，寻找并激活分区根目录下用于应道操作系统的程序（启动管理器）
7. 加载启动管理器
8. 加载操作系统

## 虚拟机

