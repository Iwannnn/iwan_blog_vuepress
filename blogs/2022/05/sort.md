---
title: 中规中矩的排序算法
date: 2022-05-23
categories:
 - 数据结构与算法
tags:
 - 有点复杂的算法
cover: /images/covers/pants.jpg
---

既然都有搜索，那排序也！

<!-- more -->

## 插入排序

::: details
~~道歉之前先把拔出来啊！！！~~
:::

### 直接插入排序

简单的排序算法，通过构建有序序列，对于未排序的数据，在已排序序列中从后往前扫描，找到合适的位置拆入。



#### code

```c
void insert_sort(int arr[], int len) {
  int i, j;
  for (i = 2; i <= len; ++i) {
    arr[0] = arr[i];
    j = i - 1;
    // while ( arr[j] > arr[0]) {
    // arr[j+1]=arr[j];
    // --j;
    // }
    for (j = i - 1; arr[j] > arr[0]; --j) {
      arr[j + 1] = arr[j];
    }
    arr[j + 1] = arr[0];
  }
}
```
#### **算法复杂度**

**空间复杂度**，用了常数个辅助单元，$O(1)$；

**时间复杂度**，最好情况，已经是升序序列了，执行要进行$n-1$次比较即可。最坏情况，序列是降序序列，每次都要比到最后再插入，比较次数为$\frac{1}{2}n(n-1)$，移动操作是比较操作次数减去$n-1$次。所以时间复杂度为$O(n^2)$；

稳定的算法

### 折半插入排序

对直接插入排序进行了改进，由于是对有序序列插入，改进了插入点的寻找，使用折半查找。



#### code

```c
void binary_insert_Sort(int arr[], int len) {
  int i, j;
  int low, high, mid;
  for (i = 2; i <= len; ++i) {
    arr[0] = arr[i];
    low = 1;
    high = i - 1;
    while (low <= high) {
      mid = low + (high - low) / 2;
      if (arr[mid] > arr[0])
        high = mid - 1;
      else
        low = mid + 1;
    }
    // 退出时 low = high
    // 1.arr[mid]=arr[0] 退出后 low == mid + 1;high == mid;将low或者high+1到j-1向后移动一格，保持稳定性
    // 2.arr[mid]>arr[0] 退出后 low == mid;high == mid - 1;将low或者high+1到j-1向后移动一格
    // 3.arr[mid]<arr[0] 退出后 low == mid + 1;high == mid;将low或者high+1到j-1向后移动一格

    for (j = i - 1; j >= high + 1; --i) {
      arr[j - 1] = arr[j];
    }
    arr[high + 1] = arr[0];
  }
}
```
#### **复杂度分析**

**空间复杂度**，和直接插入排序一样

**时间复杂度**，比较次数减少了，约为$O(nlog_2n)$，移动次数没变

稳定的o

### 希尔排序

对直接插入排序的改进，将原本固定的步长1，变成动态取值。

随便看看这个步长该怎么选择

:::tip
已知的最好步长序列是由Sedgewick提出的(1, 5, 19, 41, 109,...)，该序列的项，从第0项开始，偶数来自${\displaystyle 9\times 4^{i}-9\times 2^{i}+1}9\times 4^{i}-9\times 2^{i}+1$和奇数来自${\displaystyle 2^{i+2}\times (2^{i+2}-3)+1}2^{{i+2}}\times (2^{{i+2}}-3)+1$这两个算式。这项研究也表明“比较在希尔排序中是最主要的操作，而不是交换。”用这样步长序列的希尔排序比插入排序要快，甚至在小数组中比快速排序和堆排序还快，但是在涉及大量数据时希尔排序还是比快速排序慢。

另一个在大数组中表现优异的步长序列是（斐波那契数列除去0和1将剩余的数以黄金分割比的两倍的幂进行运算得到的数列）：(1, 9, 34, 182, 836, 4025, 19001, 90358, 428481, 2034035, 9651787, 45806244, 217378076, 1031612713,…)
:::



#### code

```c
void shell_sort(int arr[], int len) {
  int i, j, gap;
  for (gap = len >> 1; gap >= 1; gap >>= 1) { //选择步长
    for (i = gap + 1; i <= len; ++i) {        //拆分小组
      if (arr[i] < arr[i - gap]) {            //移动
        arr[0] = arr[i];
        for (j = i - gap; i > 0 && arr[0] < arr[j]; j -= gap) {
          arr[j + gap] = arr[j];
        }
        arr[j + gap] = arr[0];
      }
    }
  }
}
```

#### **复杂度分析**

**空间复杂度**，常数个辅助空间,$O(1)$

**时间复杂度**，约为$O(n^2)$

不稳定的

## 交换排序

### 冒泡排序

好像高中技术就在学这个了，现在看看真的挺简单的，大概是最简单的实现排序的算法之一了吧，当时似乎还有点迷惑。

1. 比较相邻的元素。如果第一个比第二个大，就交换它们两个。
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。
3. 针对所有的元素重复以上的步骤，除了最后一个。
4. 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。



#### code

```c
void bubble_sort(int arr[], int len) {
  int i, j;
  int flag = 0;
  for (int i = 1; i <= len - 1; ++i) {
    flag = 0;
    for (j = len; j > i; --j) {
      if (arr[j] < arr[j - 1]) {
        flag = 1;
        arr[0] = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = arr[0];
      }
      if (!flag) return;
    }
  }
}
```

#### **复杂度分析**

**空间复杂度**，$O(1)$

**时间复杂度**，冒泡和插入的时间复杂度差不多，但冒泡会对已经排列好的序列进行$O(n^2)$的比较。

稳定，比较不带等号

### 快速排序

基于分治法思想，将一个元素放置在他应该在的位置上，他的左边都比他小，右边都比他大，再对两边的序列进行排序。



```c
int partition(int arr[], int low, int high) {
  int pivot = arr[low];
  while (low < high) { // low==high 退出
    while (high > low && arr[high] >= pivot)
      --high;
    arr[low] = arr[high];
    while (high > low && arr[low] <= pivot)
      ++low;
    arr[high] = arr[low];
  }
  arr[low] = pivot;
  return low;
}

void quick_sort(int arr[], int low, int high) {
  if (low < high) {
    int pivot_pos = partition(arr, low, high);
    quick_sort(arr, low, pivot_pos - 1);
    quick_sort(arr, pivot_pos + 1, high);
  }
}
```

#### **复杂度分析**

**空间复杂度**，由于需要递归栈，最坏情况下要O(n),平均深度为$O(log_2n)$

**时间复杂度**，加入划分的不对称，那时间会被延长，最坏情况为$O(n^2)$,平均情况为$O(nlog_2n)$

不稳定

*所有内部排序算法平均性能最优*

TODO:
## 选择排序


## 归并排序

## 基数排序

## 外部排序