---
title: 比较好理解的搜索算法
date: 2022-05-16
categories:
 - 数据结构与算法
tags: 
 - 有点复杂的算法
 - 可恶的408
cover: /images/covers/flcl.jpg
---

1. 线性结构
2. 散列结构
   
<!-- more -->

## 线性结构

### 顺序查找

::: tip
虽然是归类在线序性结构里，但顺序查找再链式结构里也能够实现。
:::

1. **关键字无序**

就一个个找过去，找到最后没找到返回失败。利用```哨兵```简化代码。

**成功时的$ASL=\sum_{i=1}^{n}\frac{i}{n}=\sum_{i=1}^{n}\frac{n-i+1}{n}=\frac{1+n}{2}$（公式中从从前往后和从后往前），失败时$ASL=1+n$，每次都找完没找到**


```c
typedef struct {
  int *num;
  int size;
} seq_table;
int seq_search(seq_table seq_table, int key) {
  seq_table.num[0] = key;
  int i;
  for (i = seq_table.size; seq_table.num[i] != key; --i)
    ;
  return i;
}
```

2. **关键字有序**

关键字有序的就可以提前跳出循环，确认找不到了。

查找成功还是和无序的一样；$n$个关键字区分出$n+1$个范围，一个数属于在这个范围的概率为$\frac{1}{n+1}$，也就是可以跳出循环的概率
$q_j$代表到第$j$个结点时失败的概率；$想象成一个二叉树，叶子结点是失败情况，失败的比较次数就是叶子节点层数；

**失败时$ASL=\sum_{j=1}^{n}q_j(l_j-1)=\frac{1+2+...+n+n}{n+1}=\frac{n}{2}+\frac{n}{n+1}$**


### 折半查找

:::tip
又称为二分查找，小时候玩的一个范围内想一个数字，别人猜,最少几次猜得中。

仅适用与有序的顺序表。不是很明白，如果利用二分查找所形成的平衡二叉树，来查找那还是二分查找吗？
:::

思路挺简单的，但要注意二分分出```0.5```该怎么取数字，向上还是向下取整，不同的取整方式，最多和最少的查找比较次数

对于ASL成功失败的计算，感觉画出树形图数数会快一些。因为二叉树不一定是完全二叉树或者满二叉树，所以公式计算会有误差，但是在最底层之上的都是满的，所以误差应该不会太大。

ASL计算，还是画出比较的树，叶子节点是失败的情况，非终端结点时查找成功的情况，每层的非终端结点数乘上层数就是查找成功时的比较次数；

**成功时$ASL=\sum_{i=1}^{n}\frac{l_i}{n}=\frac{1*1+2*2+...+h*2^{h-1} }{n}=\frac{n+1}{n}*log_2(n+1)-1≈log_2(n+1)-1$**

$n$个元素二叉树树的高度为$\lceil log_2(n+1) \rceil$，查找的时间复杂度为$O(log_2n)$

是用于顺序存储，不适用链式存储

```c
typedef struct {
  int *num;
  int size;
} binary_list;
int binary_search(binary_list list, int key) { //假定升序
  int low = 0, high = list.size - 1, mid;
  while (low <= high) {
    mid = low + (high - low) / 2; //防止溢出
    if (list.num[mid] == key) {
      return mid;
    } else if (list.num[mid] < key) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}
```

### 分块查找

:::tip
又称为索引顺序查找。动态静态结构都有。
:::

基本思想就是，把查找表分成一块一块，块内可以无序也可以有序，块间是有序的。

查找分为两步，块间和块内，按照具体请快使用二分或顺序查找。

分块查找的```ASL```就把块内块间（索引）加起来就好了。

**$ASL=L_I+L_S$**

如果均匀的分成$b$块，每块$s$个记录，$n=sb$，都采用顺序查找；

$ASL=\frac{b+1}{2}+\frac{s+1}{2}=\frac{s^2+2s+n}{2s}$

当$s=\sqrt{n}$时平均查找最小，同样的方法对称最小，这也是操作系统里面有个查找使用索引更快的理论论证了吧；


如果采用对索引表采用二分查找

$ASL=\lceil log_2(b+1) \rceil +\frac{s+1}{2}$

## 散列结构

散列（哈希）就是把关键字映射到对映的地址。散的好就是O(1)

### 散列函数

1. **直接地址法**

散列函数：
```c
hash(key) = hey;
hash(key) = a * key + b;
```

优点：简单，不会造成冲突
缺点：空位多，空间冗余

2. **除留余数法**

最简单最方便的散列函数。

散列函数：
```c
hash(key) = key % p;
```

关键```p```选得好，散得好。

3. **数字分析法**

设关键字位```r```进制数，各位数的分布不一定是均匀的，根据数的分布情况设置散列函数。

书上也不说咋设置，题也没有写到。

4. **平方取中法**

取关键字平方的几个中间值作为散列地址，具体情况具体分析（王道也不举个例子:falafel:）


### 冲突处理

冲突是不可避免的，和就像现实中不可能**天降美少女**一样。那就尽量减少冲突的代价。

1. **开放地址法**

什么地址可以给同义词存也可以给非同义词存，感觉就是被冲突了就找个不冲突的地方存。
数学递推公式：

```c
h_index = (hash(key) + d_index) % m;
```

```d_index```的取法

- 线性探测法

```d_index=0/1/2/...```，当然是小于```m```不然都转圈圈的

这种方法很简单，但是存好了后，数据会坨在一起，查找花的代价可能就比较高。

- 平方探测法

```d_index=0^2,1^2,-1^2,2^2,-2^2...k^2,-k^2```，其中```k<=m/2```且```m=4k+3```的素数

避免堆积，但是，容量减少了

- 双散列法

设置两个散列函数，第一个冲突时，利用第二个计算增量，```i```为冲突次数；

```c
h_index = (hash_1(key) + i * hash_2(key)) % m;  //i为冲突次数 
```


- 伪随机序列法

```d[i]```为伪随机数

2. **拉链法**

把冲突的放在一个链表上，长得有点邻接表；数据结构就可以用邻接表的数据结构，弧结点（包含弧头，下一个弧指针），顶点结点（一些信息和第一弧线结点），和一个存储顶点节点的数组

### 性能分析

把散列表画出来，标记上是否冲突，如果冲突又进行了多少次散列，那些地方时不用冲突处理就能到达的，哪里不行。
从而分析成功与失败的```ASL```;