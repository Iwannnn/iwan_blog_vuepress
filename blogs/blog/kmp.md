---
title: KMP算法实现串的模式匹配
date: 2022-05-15 
categories:
 - 数据结构与算法
tags:
 - 有点复杂的算法
 - 可恶的408
cover: /images/covers/lips.jpg
---

随便记点对```KMP```的也许是思考的东西，关于逻辑和代码实现。

<!-- more -->

## KMP算法

由于暴力匹配很浪浪浪费所以得继续优化。

### 前缀、后缀和部分匹配值

这三个是子串的结构

- 前缀：除了最后一个字符外，字符串的所有的头部子串

- 后缀：除了第一个字符外，字符串所有的尾部子串

- 部分匹配值：字符串的前缀和后缀的最长相等前后缀长度（这个看定义好像不是很明白）。最长的相等的前缀和后缀的长度

### 算法原理

::: tip
移动位数=已匹配的字符数-对应的部分匹配值
:::

**问题**
> ```s```为被匹配的字符串,```p```为要求的字符串模式。当```p```有```j```为和```s```已经匹配了，当```j+1```位不匹配了,该怎么移动```p```进行下一步的匹配？即```next[j+1]```该是多少?

**思路**

已知前```j```位是匹配的，所以去寻找```q[1]```至```q[j]```的前缀和后缀相等的子串。如果前缀和后缀是相等的，那么挪动这个前后缀的长度就可以经行继续匹配。当这个前后缀的值该是多少？我们优先考虑部分匹配值，应为这个东西是最长的，第一眼看上去是效率是最高的，毕竟挪动越多再次需要匹配的越少。**但真的是吗？**

假设已知```next[j]=k```,此时```next[j+1]=?```存在两种情况：

:::tip
假设下标从1开始。

```next[j]=k```表示```p[j]```匹配失败时从```p[k]```重新开始匹配，即```p[1]p[2]...p[k-1]==p[j-k+1]...p[j-2]p[j-1]```
:::

1. ```p[k]==p[j]``` 即```p[1]p[2]...p[k-1]p[k]==p[j-k+1]...p[j-1]p[j]```，如果是这样就太好了,直接```next[j+1]=next[j]+1```就好了j

2. ```p[k]!=p[j]``` 即```p[1]p[2]...p[k-1]p[k]!=p[j-k+1]...p[j-1]p[j]```，这里的前缀和后缀匹配失败了，好像有点自己和自己匹配的感觉。```p[j]```又是一直呆在最后的，后缀最后是不会变得，那只好改一下前缀的最后了。由于是第```k```位匹配失败了，令```k'=next[k]```，此时```p[1]p[2]...p[k'-1]==p[k-k'+1]...p[k-2]p[k-1]```，则```p[1]p[2]...p[k'-1]==p[j-k'-1]...p[j-2]p[j-1]```，那么就来判断```p[k']==p[j]```！如果相等则是情况1，如果不相等那么就还是情况2，继续去找```k''```、```k'''```...

**这个查找```next[j]```的思路有点递归，又有点回溯的感觉。好像有吧。**

### 代码实现

```c
#include <string.h>
void get_next(char *p, int next[]) {
  int i = 1, j = 0;
  next[i] = 0;
  while (i < strlen(p) - 1) {     //第0位不用
    if (j == 0 || p[i] == p[j]) { // p[i]==p[j],next[j+1]=next[j]+1
      ++i;
      ++j;
      next[i] = j;
    } else {
      j = next[j]; // p[i]!=[j] k'=next[k]
    }
  }
}

int kmp(char *s, char *p, int next[]) {
  int i = 1, j = 1;
  while (i <= strlen(s) - 1 && j <= strlen(p) - 1) {
    if (j == 0 || s[i] == p[j]) { //匹配成功
      ++i;
      ++j;
    } else { //匹配失败，挪
      j = next[j];
    }
  }
  if (j > strlen(p)) { //匹配成功，范围起始位置
    return i - strlen(p) + 1;
  } else { //匹配失败
    return 0;
  }
}
```
### 优化

::: warning
 为什么需要优化的？
:::

::: tip
如果每次的```p[next[j]]```和原本错误的值```p[j]```的值一样那么岂不是还得继续```next```，所以部分匹配值不一定最佳的。
:::

```c
void get_next(char *p, int next[]) {
  int i = 1, j = 0;
  next[i] = 0;
  while (i < strlen(p) - 1) {     //第0位不用
    if (j == 0 || p[i] == p[j]) { // p[i]==p[j],next[j+1]=next[j]+1
      ++i;
      ++j;
      // next[i] = j;
      if (p[i] != p[j]) {
        next[i] = j;
      } else { //既然p[i]==p[j] 那么可定再次匹配失败，肯定要继续找next[j],那就直接赋给它吧
        next[i] = next[j];
      }
    } else {
      j = next[j]; // p[i]!=[j] k'=next[k]
    }
  }
}

```
 