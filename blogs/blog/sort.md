---
title: 基础的内部排序算法
date: 2022-05-23
categories:
 - 数据结构与算法
tags:
 - 有点复杂的算法
 - 可恶的408
cover: /images/covers/pants.jpg
---

既然都有搜索，那排序也！

<!-- more -->

## 插入排序

::: details
~~道歉之前先拔出来啊！！！~~
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

**注意插入到那个位置，模拟两种分支，在high+1都满足**

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

    // 1.arr[mid]=arr[0] 退出后 low == mid + 1;high == mid;将low或者high+1到j-1向后移动一格，保持稳定性
    // 2.arr[mid]>arr[0] 退出后 low == mid;high == mid - 1;将low或者high+1到j-1向后移动一格
    // 3.arr[mid]<arr[0] 退出后 low == mid + 1;high == mid;将low或者high+1到j-1向后移动一格

    for (j = i - 1; j >= high + 1; --i) {
      arr[j + 1] = arr[j];
    }
    arr[high + 1] = arr[0];
  }
}
```
#### **复杂度分析**

**空间复杂度**，和直接插入排序一样

**时间复杂度**，比较次数减少了，约为$O(nlog_2n)$，移动次数没变，所以还是$O(n^2)$

稳定的o

### 希尔排序

对直接插入排序的改进，将原本固定的步长1，变成动态取值。

随便看看这个步长该怎么选择

:::tip
已知的最好步长序列是由Sedgewick提出的(1, 5, 19, 41, 109,...)，该序列的项，从第0项开始，偶数来自${\displaystyle 9\times 4^{i}-9\times 2^{i}+1}9\times 4^{i}-9\times 2^{i}+1$和奇数来自${\displaystyle 2^{i+2}\times (2^{i+2}-3)+1}2^{{i+2}}\times (2^{{i+2}}-3)+1$这两个算式。这项研究也表明“比较在希尔排序中是最主要的操作，而不是交换。”用这样步长序列的希尔排序比插入排序要快，甚至在小数组中比快速排序和堆排序还快，但是在涉及大量数据时希尔排序还是比快速排序慢。

另一个在大数组中表现优异的步长序列是（斐波那契数列除去0和1将剩余的数以黄金分割比的两倍的幂进行运算得到的数列）：(1, 9, 34, 182, 836, 4025, 19001, 90358, 428481, 2034035, 9651787, 45806244, 217378076, 1031612713,…)
:::


**注意```i=gap+1```相当于直接插入排序的时候的```i=2```，先比较一次会比较省时**

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

**时间复杂度**，某个特定范围下为$O(n^{1.3})$，约为$O(n^2)$

不稳定的

## 交换排序

冒泡排序和交换排序其实都是在一次排序过程中确定了一个位置的数据，冒泡排序是第一个最大或最小，快速排序是选择一个数，把他放在它该在的位置，左边都比他小，右边都比他大；

### 冒泡排序

好像高中技术就在学这个了，现在看看真的挺简单的，大概是最简单的实现排序的算法之一了吧，当时似乎还有点迷惑。

1. 比较相邻的元素。如果逆序，就交换它们两个。
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。
3. 针对所有的元素重复以上的步骤，除了最后一个。
4. 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。


**别和选择排序弄混了！！！一个个比一个个冒泡，不是选最小的换上去；**


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

**需要先对非固定位置数据一侧进行操作，这要才有空间替换数据，用被定位的数据原先存在的位置作为空位**

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


## 选择排序

### 简单的选择排序

简单的排序算法，找出未排序序列的最小值再换一换就好了。

#### code

```c
void selection_sort(int arr[], int len) {
  int i, j;
  for (int i = 1; i < len; ++i) {
    int min_index = i;
    for (j = i + 1; j <= len; ++j) {
      if (arr[j] < arr[min_index]) {
        min_index = j;
      }
    }
    if (min_index != i) {
      arr[0] = arr[j];
      arr[j] = arr[min_index];
      arr[min_index] = arr[0];
    }
  }
}
```

#### **效率分析**

**空间复杂度**，$O(1)$
**时间复杂度**，最情况加不需要进行交换，移动$0$次,最坏情况下移动$3(len-1)$次，比较次数和初始序列无关为$\frac{n(n-1)}{2}$,所以时间复杂度为$O(n^2)$

算法是不稳定的，相等的值先找的会先被标记，可能会被替换到后面；

### 堆排序

利用堆这个数据结构构建出来的排序算法，堆近似于一个完全二叉树

:::tip
堆是一种特别的完全二叉树，给定堆任意节点P和C，若P是C的双亲节点，那么P的值会小于等于（或大于等于）C的值
:::

堆通常使用数组来是实现的，利用完全二叉树的性质通过下标的访问孩子节点

设一个节点下标为i
| 节点   | 起始为0               | 起始为1                   |
| ------ | --------------------- | ------------------------- |
| 父     | $\lfloor i/2 \rfloor$ | $\lfloor (i-1)/2 \rfloor$ |
| 左孩子 | $2i+1$                | $2i$                      |
| 右孩子 | $2i+2$                | $2i+1$                    |


堆排序的关键是构造初始堆，从第$\lfloor n/2 \rfloor$（下标从1开始）节点开始到第$1$个节点向前构建大顶堆。

堆也支持插入操作，将最新节点放在堆的最后面，对这个新的节点向上执行调整操作

**不怎么熟悉的代码！对于构造大顶堆获得递增序列，从最后一个非终端结点开始构建，和孩子结点相比，如果孩子比自己大就交换（可能每右孩子注意判断），可能出现交换后的孩子还是比自己大的情况，所以循环下去（```parent=child;child=2*parent;```）;在构建完后，从顶上去取出最大元素和最后一个数值交换，在对顶点重新```max_heapify()```，数组总数要少一个**

#### code 


```c
void swap(int *a, int *b) {
  int temp = *a;
  *a = *b;
  *b = temp;
}

void max_heapify(int arr[], int start, int end) {
  int parent = start;
  int child = parent * 2;
  while (child <= end) {
    if (child + 1 <= end && arr[child] < arr[child + 1]) { //左孩子和有孩子哪个大
      ++child;
    }
    if (arr[parent] > arr[child]) { //没有交换不会对子树造成影响
      return;
    } else {
      swap(&arr[parent], &arr[child]); //发生交换，纠正对子树产生的影响
      parent = child;
      child = parent * 2; //如果下标从0开始那 child = parent * 2 + 1;
    }
  }
}

void heap_sort(int arr[], int len) {
  int i;
  //初始化，从下网上初始化大顶堆
  for (i = len / 2; i > 0; --i) {
    max_heapify(arr, i, len);
  }
  //替换元素，重新构建堆循环
  for (int i = len; i > 1; --i) {
    swap(&arr[1], &arr[i]);     //将最大的放到最后
    max_heapify(arr, 1, i - 1); // arr[1]位置发生变化，重新构建大顶堆
  }
}
```
#### **效率分析**

**空间复杂度**，$O(1)$
**时间复杂度**，初始化堆的时间为$O(n)$吗，之后有$n-1$次交换和向下调正测操作，每次调整高度为$log_2i$，所以时间复杂度为$O(nlog_2n)$

算法是不稳定的，可能会将前面的值先换入顶中，在交换之数组末尾

## 归并排序

基于分治法的思想，逐层排序

这个算法递归实现也可以迭代实现

#### 递归（recursion）的合并操作

1. 申请空间，为两个子序列之和
2. 申请两个指针，指向两个子序列的头
3. 比较大小，放入申请空间
4. 重复3，直至末尾
5. 将剩余元素放入申请空间

#### 迭代（iteration）的合并操作

1. 将相邻两个元素经行排序形成$\lceil \frac{n}{2} \rceil$个子序列
2. 重复1，直至序列数为1


**这个也不是很熟，关键是按照分治法的思想来写；递归实现，分的代码想法是分开后合并加上递归就很好实现；迭代实现要注意！对于左右范围计算的合法性检验；用一个数组存部分有序的数组，一个数组用于存这个部分有序一次合并后的数组；利用 ```temp```实现两个数组之间的转换；最外面的循环时间隔大小，内部循环每次只做一个间隔的排序；**

#### code

```c
//治
int *temp=(int *)malloc(sizeof(int)*(n+1))
void conquer(int &arr[], int left, int mid, int right) {
	for(int i = left;i <= right;++i)
		temp[i] = arr[i];
  int i = left, j = mid + 1, index = left;
  while (i <= mid && j <= right) {
    arr[index++] = temp[i] < temp[j] ? temp[i++] : temp[j++];
  }
	while (i <= mid) arr[index++] = temp[i++];
	while (j <= right) arr[index++] = temp[j++];
}

//分
void divide(int &arr[], int left, int right) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    divide(arr, left, mid);
    divide(arr, mid + 1, right);
    conquer(arr, left, mid, right);
  }
}

void merge_sort(int &arr[], int len) {
  divide(arr, 1, len);
}

int min(int a, int b) {
  return a < b ? a : b;
}

void itera_merge_sort(int arr[], int len) {
  int *a = arr;
  int *b = (int *)malloc(sizeof(int *) * len);
  int seg, start;
  for (seg = 1; seg < len; seg += seg) {              //分
    for (start = 1; start <= len; start += 2 * seg) { //治
      int left = start, mid = min(start + seg, len), right = min(start + 2 * seg, len);
      int index = left;
      int start1 = left, end1 = mid;
      int start2 = mid + 1, end2 = right;
      while (start1 < end1 && start2 < end2) {
        b[index++] = a[start1] < a[start2] ? a[start1++] : a[start2++];
      }
      while (start1 <= end1) {
        b[index++] = a[start1++];
      }
      while (start2 <= end2) {
        b[index++] = a[start2++];
      }
    }
    int *temp = a;
    a = b;
    b = a;
  }
  if (a != arr) {                    //不知道会经过多少次交换哪个数组是指向原先的arr ,若b指向arr
    for (int i = 0; i <= len; ++i) { //将有序的a的值赋给b
      b[i] = a[i];
    }
    b = a; // b指向a
  }
  free(b);
}
```

#### **效率分析**

**空间复杂度**，需要用到n个额外空间，$o(n)$

**时间复杂度**，每趟归并时间复杂度为$O(n)$,二路归并总共需要进行$nlog_2n$次归并，所以整体时间复杂度为$O(nlog_2n)$

是稳定的

## 基数排序

非比较型的整数排序算法，将整数按位数切割成成不同数组，按进制大小进行比较，基数排序的方式可以采用LSD（Least significant digital）或MSD（Most significant digital），LSD的排序方式由键值的最右边开始，而MSD则相反，由键值的最左边开始。

**这里的数字排序已经不是把他看成数字了（感觉），他又三位数三位的权重为（100、10、1），对影响较小（权重）的部分先排序，在对影响大的排序，小的影响怎么样都干扰不到大的，最后大的内部小的是有序的！实现整体有序；（胡言乱语）**

#### **效率分析**

**空间复杂度**，需要有进制个数的额外空间，$O(r)$

**时间复杂度**，整体数据的位数$d$乘上分配所需的$O(n)$加上进制所需的$O(r)$，总共为$O(d(n+r))$

