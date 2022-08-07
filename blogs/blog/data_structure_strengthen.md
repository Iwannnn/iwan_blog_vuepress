---
title: 数据结构强化
date: 2022-08-04
categories:
 - 数据结构
tags:
 - 可恶的408
cover: /images/covers/nazuna.png
---

我也想熬夜偶遇nazuna

<!-- more -->

## 数组

### 行优先？列优先？

行列优先问题，不是固定的；行优先则在存储器中是每行的元素都是连续存储了，一行完了接下一行，列优先同理；要根据行列优先的方式，写出更具有局部性原理的代码；

**数组物理地址计算**

$Loc(a_{i})=Loc(a_{0})+i*L$

设矩阵的范围为$a[0][0]\sim a[n_1][n_2]$

**行优先下标计算**

$Loc(a_{i,j})=Loc(a_{0,0})+[(n_1+1)*i+j]$

**列优先下标计算**

$Loc(a_{i,j})=Loc(a_{0,0})+[(n_2+1)*j+i]$

### 矩阵压缩

#### 对称矩阵

矩阵为$a[i][j]$对应到一维数组$b[k]$

**矩阵下标1开始，数组下标1开始**

$$ 
k=\left\{
\begin{aligned}
\frac{i(i-1)}{2}+j &, & i \ge j\\
\frac{j(j-1)}{2}+i &, & i < j
\end{aligned}
\right.
$$

**下标从$0$开始矩阵下标0开始，数组下标0开始**

$$ 
k=\left\{
\begin{aligned}
\frac{i(i+1)}{2}+j &, & i \ge j\\
\frac{j(j+1)}{2}+i &, & i < j
\end{aligned}
\right.
$$

王道书上给出的的是，他似乎是把矩阵下标从1开始，压缩后的数组下标从0开始，这也太怪了吧，总得都从1或者都从0开始吧；如果真的出现了这种情况，那就按找矩阵的形式先写出k的递推公式，然后再对递推公式+1，-1具体判断；
$$ 
k=\left\{
\begin{aligned}
\frac{i(i-1)}{2}+j-1& , & i \ge j\\
\frac{j(j-1)}{2}+i-1& , & i < j
\end{aligned}
\right.
$$


#### 上/下三角矩阵

我的想法是，上下三角和对称其实很像，都是存一半，只不过上下三角要多存一个$0$

**但是**上三角没有下三角那么简单！下三角不用管$n$也能够算出来，但是上三角就不行了，不然就不知道一行到底多长！

**下三角$0$开始**

$$ 
k=\left\{
\begin{aligned}
& \frac{i(i+1)}{2}+j &, & i \ge j\\
& \frac{n(n+1)}{2} &, & i < j
\end{aligned}
\right.
$$

**下三角$1$开始**

$$ 
k=\left\{
\begin{aligned}
& \frac{i(i-1)}{2}+j &, & i \ge j\\
& \frac{n(n+1)}{2}  &, & i < j
\end{aligned}
\right.
$$

**上三角，矩阵下标0开始，数组下标0开始**

$i$行有$n-i$个元素，前$i-1$行共$\frac{i(2n-i+1)}{2}$个元素

$$ 
k=\left\{
\begin{aligned}
&\frac{i(2n-i+1)}{2}+(j-i) &, & i \le j\\
&\frac{n(n+1)}{2} &, & i > j
\end{aligned}
\right.
$$

**上三角，矩阵下标1开始，数组下标1开始**

$i$行有$n+1-i$个元素，前$i-1$行共$\frac{(i-1)(2n-i+2)}{2}$个元素

$$ 
k=\left\{
\begin{aligned}
& \frac{(i-1)(2n-i+2)}{2}+(j-i+1) &, & i \le j\\
& \frac{n(n+1)}{2} &, & i > j
\end{aligned}
\right.
$$

#### 三对角矩阵

第一行最左边是少了一个的，计算要注意一下；

**矩阵下标1开始，数组下标1开始**，从简单点的先推

前$i-1$行总共由的数目，位于当前行的第一个得到

$$
k=3*(i-1)-1+[j-(i-1)+1]=2i+j-2
$$

**矩阵下标0开始，数组下标0开始**，假装能看到第一行左边缺少的，为-1

$$
k=3*i-1+[j-(i-1)]=2i+j
$$

同样如果下标不一致。先用矩阵下标写出对应的递推公式，在+1，-1；

## 栈

先进后出！

虽然很多遍，但是还是怕忘记；指针存的是一个地址，用```*```是用来取值（通过指针存储的地址，获取存储的值），```&```用来取地址；访问结构体通常用```.```，但是如果是结构体指针访问则需要用```->```，在对结构体指针取值后又变回了结构体，可以用```.```如```(*a).b```等价于```a->b```，一定要加括号！```.```和```->```的优先级和括号，数组一样高；

### 数据结构

#### 顺序存储

#### 链式存储

注意带头结点的操作，会不一致；头结点的数据域可以不设信息，或者记录点表长之类的信息；

1. 单向链表，如果要求```pop```那么可能得从头开始，得判断```->next->next```,遍历完所有才能删除；采用头插法可以实现升序和逆序的转变o；
2. 双向链表
3. 循环链表

### 手绘

### 基本操作

```c
#include <stdio.h>
#include <stdlib.h>
#define Max 233

typedef struct stack_list {
  int stack[Max];
  int top;
} stack_list;

typedef struct stack_node {
  int data;
  struct stack_node *next, *prev;
} stack_node;

typedef struct stack_link {
  stack_node *top;
  stack_node *bottom;
} stack_link;

stack_list *init_stack_list() {
  stack_list *res;
  res->top = -1;
  return res;
}

int is_full_stack_list(stack_list *s) {
  if (s->top == Max - 1)
    return 1;
  else
    return 0;
}

int is_null_stack_list(stack_list *s) {
  if (s->top == 0)
    return 1;
  else
    return 0;
}

int insert_stack_list(stack_list *s, int data) {
  if (is_full_stack_list(s)) return 0;
  s->stack[++s->top] = data;
  return 1;
}

int pop_stack_list(stack_list *s) {
  if (is_null_stack_list(s)) return -1;
  int res = s->top--;
  return res;
}

int get_top_stack_list(stack_list *s) {
  if (is_null_stack_list(s))
    return -1;
  else
    return s->stack[s->top];
}

stack_node *init_stack_node(int data) {
  stack_node *res = (stack_node *)malloc(sizeof(stack_node));
  return res;
}

stack_link *init_stack_link() {
  stack_link *res = (stack_link *)malloc(sizeof(stack_link));
  return res;
}

int is_null_stack_link(stack_link *s) {
  if (!s->top)
    return 1;
  else
    return 0;
}

int push_stack_link(stack_link *s, int data) {
  stack_node *node = init_stack_node(data);
  if (is_null_stack_link(s)) {
    s->top = node;
  } else {
    s->top->next = node;
    node->prev = s->top;
    s->top = node;
  }
  return 1;
}

int pop_stack_link(stack_link *s) {
  if (is_null_stack_link(s)) {
    return 0;
  } else {
    stack_node *node = s->top;
    s->top = s->top->prev;
    s->top->next = NULL;
    free(node);
    return 1;
  }
}

int get_top_stack_link(stack_link *s) {
  if (is_null_stack_link(s)) {
    return -1;
  } else {
    return s->top->data;
  }
}
```

## 队列

先进先出

有三种不同的判断队列空和满的方法

### 数据结构

#### 顺序存储

#### 链式存储

### 手绘

### 基本操作

```c
#include <stdio.h>
#include <stdlib.h>
#define Max 233

// front为即将出队列的位置，rear为入队列的位置
typedef struct queue_list {
  int front, rear;
  int queue[Max];
  int size; //记录当前大小
  int tag;  //标记是空导致的还是满导致的rear==front
} queue_list;

queue_list *init() {
  queue_list *res = (queue_list *)malloc(sizeof(queue_list));
  res->front = 0;
  res->rear = 0;
  res->size = 0;
  res->tag = 0;
  return res;
}

int is_null_queue_list_1(queue_list *q) {
  if (q->front == q->rear)
    return 1;
  else
    return 0;
}

int is_null_queue_list_2(queue_list *q) {
  if (q->size == 0)
    return 1;
  else
    return 0;
}

int is_null_queue_list_3(queue_list *q) {
  if (q->tag == 0 && q->rear == q->front)
    return 1;
  else
    return 0;
}

int is_full_queue_list_1(queue_list *q) { //留一个空间，如果在塞一个rear==front就是满了，为避免和相同判断
  if (q->front == (q->rear + 1) % Max == 0)
    return 1;
  else
    return 0;
}

int is_full_queue_list_2(queue_list *q) {
  if (q->size == Max)
    return 1;
  else
    return 0;
}

int is_full_queue_list_3(queue_list *q) {
  if (q->tag == 1 && q->front == q->rear)
    return 1;
  else
    return 0;
}

int insert_queue_list_1(queue_list *q, int data) {
  if (is_full_queue_list_1(q))
    return 0;
  else {
    q->queue[q->rear] = data;
    q->rear = (q->rear + 1) % Max;
    return 1;
  }
}

int insert_queue_list_2(queue_list *q, int data) {
  if (is_full_queue_list_2(q)) {
    return 0;
  } else {
    q->queue[q->rear] = data;
    ++q->size;
    q->rear = (q->rear + 1) % Max;
    return 1;
  }
}
int insert_queue_list_3(queue_list *q, int data) {
  if (is_full_queue_list_3(q)) {
    return 0;
  } else {
    q->queue[q->rear] = data;
    q->rear = (q->rear + 1) % Max;
    q->tag = 1;
    return 0;
  }
}

int delete_queue_list_1(queue_list *q) {
  if (is_full_queue_list_1(q)) {
    return 0;
  } else {
    q->front = (q->front + 1) % Max;
    return 1;
  }
}

int delete_queue_list_2(queue_list *q) {
  if (is_null_queue_list_2(q)) {
    return 0;
  } else {
    q->front = (q->front + 1) % Max;
    --q->size;
    return 1;
  }
}
int delete_queue_list_3(queue_list *q) {
  if (is_null_queue_list_3(q)) {
    return 0;
  } else {
    q->front = (q->front + 1) % Max;
    q->tag = 0;
    return 1;
  }
}

int get_front_queue_list_(queue_list *q) {
  if (is_null_queue_list_1(q)) { //判断非空都行
    return -1;
  } else {
    return q->queue[q->front];
  }
}

int get_size_queue_list(queue_list *q) {
  return (q->rear + Max - q->front) % Max;
}

typedef struct queue_node {
  int data;
  struct queue_node *next, *prev;
} queue_node;

typedef struct queue_link {
  int size;
  queue_node *front, *rear;
} queue_link;

queue_node *init_queue_node(int data) {
  queue_node *res = (queue_node *)malloc(sizeof(queue_node));
  res->data = data;
  res->next = NULL;
  res->prev = NULL;
  return res;
}

queue_link *init_queue_link() {
  queue_link *res = (queue_link *)malloc(sizeof(queue_link));
  res->size = 0;
  res->front = NULL;
  res->rear = NULL;
  return res;
}

int is_null_queue_link(queue_link *q) {
  if (q->front == NULL)
    return 1;
  else
    return 0;
}

int insert_queue_node(queue_link *q, int data) {
  queue_node *node = init_queue_node(data);
  ++q->size;
  if (is_null_queue_link(q)) {
    q->front = node;
    q->rear = node;
    node->prev = q->front;
  } else {
    node->prev = q->rear;
    q->rear->next = node;
    q->rear = node;
  }
  return 1;
}

int delete_queue_node(queue_link *q) {
  if (is_null_queue_link(q)) {
    return 0;
  } else {
    queue_node *node = q->front;
    int res = node->data;
    q->front = node->next;
    node->next->prev = NULL;
    if (q->rear == node) {
      q->rear = q->front;
    }
    free(node);
    return res;
  }
}
```

## 树

### 性质计算

- 结点数，结点数为0是空树，$结点数n=总度数m+1$，
- 边数，边数=结点数+$1$
- 度数，节点度，结点的孩子数；总度数为子树的数量，树的度数为最多子树结点的子树的数量；度大于$0$的结点称为分支节点（非终端结点）、度等于$0$的节点称为叶子节点（终端结点）；度为$m$的树，第$i$层至多$m^{i-1}(i\ge1)$个结点
- 层次，根结点第1层，它的子节点第2层...
- 深度，从上往下逐层累加，
- 高度，从下往上逐层累加，高度为$h$的$m$叉树至多$1+m+m^2+...+m^{h-1}=\frac{m^h-1}{m-1}$个结点；$n$个结点的$m$叉树最小高度（满时最低），$m^h-1=n(m-1)$得到$h\ge log_m(n(m-1)+1)$即最小$h=\lceil log_m(n(m-1)+1)\rceil$

#### 二叉树性质

1. 二叉树$n=n_0+n_1+n_2=n_1+2n_2+1$所以$n_2+1=n_0$
2. 低$k$层上至多$2^{k-1}$个结点
3. 高度为$h$的二叉树至多$2^h-1$个结点（满）
4. 完全二叉树从上至下，从左至右编号为$1,2,...,n$,结点$i(i>1)$的双亲结点为$\lfloor \frac{i}{2} \rfloor$；$2i\le n$时，左孩子为$2i$，为偶数；$2+i1\le n$时，右孩子为$2i+1$，为奇数；
5. 如果编号从$0$开始，父节点为$\lfloor \frac{i-1}{2} \rfloor$，左孩子为$2i+1$，为奇数；右孩子为$2i+2$，为偶数；
6. 完全二叉树$2^{h-1} \le n \le 2^h-1$，写成了两边统一的形式的话，$2^{h-1} \le n < 2^h$得$\lfloor log_2n\rfloor+1$或$2^{h-1}-1 < n \le 2^h-1$得$h=\lceil log_2(n+1)\rceil$
### 数据结构



#### 二叉树

```c
#include "../list/queue.c"
#include <stdio.h>
#include <stdlib.h>
#define Max 233

typedef int binary_tree_list[Max]; //假装是一个完全二叉树，按照下标访问；

typedef struct binary_tree_node { //链式存储
  int data;
  struct binary_tree_node *l_child, *r_child;
  struct binary_tree_node *parent;
} binary_tree_node;

void visit(binary_tree_node *node);

// 也可以整个对访问结点判断，但分开写感觉更有逻辑点；
void LDR(binary_tree_node *root) { //中序遍历
  if (root->l_child) LDR(root->l_child);
  visit(root);
  if (root->r_child) LDR(root->r_child);
}
void DLR(binary_tree_node *root) {
  visit(root);
  if (root->l_child) DLR(root->l_child);
  if (root->r_child) DLR(root->r_child);
}
void LRD(binary_tree_node *root) {
  if (root->l_child) LRD(root->l_child);
  if (root->r_child) LRD(root->r_child);
  visit(root);
}
void bfs(binary_tree_node *root) { //没有实现队列，本来想拿之前写的用的，但是存储得数据类型不对，也就懒得改了；
  queue_list *q = init();
  binary_tree_node *p;
  insert_queue_list(q, root);
  while (!is_null_queue_list(q)) {
    p = pop_queue_list(q);
    visit(p);
    if (p->l_child) insert_queue_list(q, p->l_child);
    if (p->r_child) insert_queue_list(q, p->r_child);
  }
}

typedef struct binary_tree_thread_node {
  int data;
  struct binary_tree_thread_node *l_child, *r_child;
  int l_tag, r_tag; //如果tag标志为0，则孩子指针指向孩子；如果tag标志为1，则左孩子指向直接前驱，右孩子指向直接后继；
} thread_node;

void thread_LDR(thread_node *p, thread_node *pre) { //中序遍历
  if (!p) return;
  thread_LDR(p->l_child, p);
  if (!p->l_child) {
    p->l_child = p;
    p->l_tag = 1;
  }
  if (pre && !pre->r_child) {
    pre->r_child = p;
    pre->r_tag = 1;
  }
  thread_LDR(p->r_child, p);
}
```

#### 多叉树、森林

森林在孩子兄弟树中，相当于各个根节点为兄弟；

```c
#include <stdio.h>
#include <stdlib.h>
#define Max

typedef struct parent_tree_node {
  int data;
  int parent;
} parent_tree_node;

typedef struct parent_tree {
  parent_tree_node *parent_tree;
  int n;
} parent_tree;

parent_tree *init_parent_tree(int n) {
  parent_tree *res = malloc(sizeof(parent_tree));
  res->n = n;
  res->parent_tree = malloc(sizeof(parent_tree_node) * n);
  return res;
}

typedef struct child_tree_node {
  int data;
  struct child_tree_node *next_child;
} child_tree_node;

typedef struct child_tree_list_node { //有些像邻接表，结点会重复存储
  int data;
  child_tree_node *first_child;
} child_tree_list_node;

typedef struct child_tree {
  child_tree_list_node *node_list;
  int n;
} child_tree;

child_tree *init_child_tree(int n) {
  child_tree *res = malloc(sizeof(child_tree));
  res->n = n;
  res->node_list = malloc(sizeof(child_tree_list_node) * n);
  return res;
}

typedef struct child_sibling_tree_node {
  int data;
  struct child_sibling_tree_node *first_child, *next_sibling; //右孩子是树的第一个孩子，左孩子是树的下一个兄弟
} child_sibling_tree_node;
```
#### 树、森林、二叉树得遍历

树、森林、二叉树对应得遍历方式

- **树**，先根遍历和后根遍历；
- **森林**，先序遍历和后序遍历；
- **二叉树**，先序遍历、中序遍历和后序遍历；

相对应关系都是要转到孩子兄弟书上的！
| 树       | 森林     | 二叉树   |
| -------- | -------- | -------- |
| 先根遍历 | 先序遍历 | 先序遍历 |
| 后根遍历 | 中序遍历 | 中序遍历 |


### 应用

#### 哈夫曼树

**手绘，文字描述建树（编码）过程**

每个都有相应得权值，权值越高被访问到的可能性越大，如果路径越短则消耗越少；

对所有结点的权值排序，找到两个权值最小的结点，合成一个结点作为一个哈夫曼树（二叉树）的左右孩子，将这个权值的和作为一个新的结点，插入到原先的队列中，继续找两个权值最小的结点，以此类推，直到只剩下一个结点；

**手绘，文字描述查找（译码）过程**

假设二叉树左孩子分支编码为1，右孩子编码分支为0；从二叉树的根节点开始查找，遇到1找左孩子，遇到0找右孩子，直到找到叶子节点表示这个字串译码完毕，取出节点中存储的数据；

哈夫曼树是前缀编码，因为到叶子节点就没有孩子了，那这个编码就不会称为其他编码的前缀了；

**带权路径长度WPL**

叶结点的权值*到这个叶节点路径的长度的累加；

$$
WPL=\sum_{i=0}^nw_il_i
$$

#### 并查集

真不知道这是个啥；网上搜了个[并查集](https://blog.csdn.net/weixin_38279101/article/details/112546053)

1. 定义：处理不相交集合的合并和查询问题
2. 并&查
- 查找(find)，查询两个元素是否在同一个集合中
- 合并(union)，把两个不相交的集合合并为一个集合
3. 数据结构，采用双亲表示法存储，父结点表示，属于的集合
4. 路径压缩，一个集合可能会很长很长那就觉得有些犯了，把他都改成同一个父节点，不要层层传递；

```c
#include <stdio.h>
#include <stdlib.h>
#define Max 233
int parent[Max];

void init(int n) {
  for (int i = 0; i < n; ++i) {
    parent[i] = i; //每个结点的父节点是自己
  }
}

int find_recursion(int x) { // 找到自己从属结点的根节点
                            // if (parent[x] == x)
                            //   return x;
                            // else
                            //   return find_recursion(parent[x]);
  return parent[x] == x ? x : find_recursion(parent[x]);
}

int find_loop(int x) {
  while (x != parent[x]) {
    x = parent[x];
  }
  return x;
}

void merge(int i, int j) { // union命名冲突，把j合并到i中去，假如ij都不是自己根结点，要找到根再合并，把j的根合并到i的根上
  parent[find_recursion(j)] = find_loop(i);
}

int path_compress_find(int x) {
  if (parent[x] == x) {
    return x;
  } else {
    parent[x] = path_compress_find(parent[x]); //将自己父节点设置为这个集合的根节点
    return parent[x];
  }
}
```

#### 各种查找树

之前简单记过比较麻烦的[查找树](/blogs/blog/complex_search.md)

1. 二叉查找树，就是二叉树的定义，但是呢，左边子树大于根节点大于右子树；
2. 二叉平衡树，在二叉树的数据结构基础上，添加了结点的平衡因子，左边节点的高度减去右边结点的高度，平衡因子的绝对值不超过1；
3. 红黑树，五个特征，最关键的是到叶子结点黑色结点个数相等，红色结点不能连红色结点；
4. B树，m叉树，利用关键字区分数据的范围同时划分结点，左结点小于根小于右结点，除了根结点，其他非叶结点子树不能少于$\lceil \frac{m}{2} \rceil$个，即至少有$\lceil \frac{m}{2} \rceil-1$个关键字
5. B+树，在B树的基础上，叶子节点存了所有的关键字，B树分支节点存了关键字后就不存了，把所有的叶子节点链接起来；

ASL的分析就留到查找

## 图

### 性质计算

- 结点数，n
- 边数，有向图出去的是弧尾，进入的是弧头，
- 度数，无向图$n$个顶点$e$条边，总度数为$2e$；有向图的顶点的度数为出度入读和，总出度等于总入读等于边数
- 子图，一个图的顶点和边的集合是另一个图子集，则被称为子图，但不是任何子集都能构成子图；
- 连通性，无向图如果任意顶点到另一个顶点都有路径存在就是连通，那就是连通图，连通图最少的边数为$n-1$，如果是非连通图，最多有$\frac{(n-1)(n-2)}{2}=C_{n-1}^2$条边（剩余结点全部连满），极大连通子图为连通分量
- 强连通性，有向图任意一对顶点都有互相到达的边为强连通图，强连通图最少的边数为$n$构成环路；极大强连通子图被称为强连通分量；
- 生成树、生成森林，包含所有节点的极小连通子图（一个为树，多个为森林），砍去一条边就变成非连通图，加上一条边就会产生回路
- 稠密、稀疏，$|E|\le|V|log|V|$视为系数
- 路径、路径长度、回路，顶点到顶点经过的顶点序列，路径上边的数目为边的长度，第一个顶点和最后一个顶点相同称为回路或换；$n$个顶点的图边数大于$n-1$那一定有环
- 简单路径、简单回路，路径序列中没有重复结点，回路除第一个最后一个外
- 距离，最短路径为距离
- 有向树，一个顶点入度为0，其余顶点入度为1


### 数据结构

#### 邻接矩阵

行的和为出度，列的和为入度；

构造n个顶点e条边的邻接矩阵时间复杂度为$O(N^2+E)$，初始化邻接矩阵

**邻接矩阵$A^n$中的元素$A[i][j]$等于由顶点$i$到顶点$j$长度为n的路径的数目**

```c
typedef struct adj_array {
  int vertex[Max];
  int arc[Max][Max]; // array[i][j]=1表示存在i结点到j结点的边，或者放权值
  int vertex_num, arc_num;
} adjacency_array;
```

#### 邻接表

是用于便比较稀疏的存储，节省空间；需要的空间为$O(N+2E)$（n个头节点和2e个弧结点）

```c
//邻接表定义不是很熟，有arc_node（用于连接vertex）和vertex_node，
typedef struct adj_list_arc_node {
  int adj_vex;                        //存储弧头
  int info;                           //边的权值
  struct adj_list_arc_node *next_arc; //指向下一个弧
} adj_arc_node;

typedef struct adj_list_vertex_node {
  int data;                //顶点信息
  adj_arc_node *first_arc; //第一个弧
} adj_vertex_node;

typedef struct adj_graph {
  adj_vertex_node adj_lsit[Max]; //邻接表，存了所有结点和弧
  int vertex_num, arc_num;
} adj_graph;

```

#### 十字链表

存储有向图

输入顶点数，弧数等，先初始化顶点，在输入每条弧的弧头和弧尾，申请新的弧线结点；采用头插法，为新申请的弧结点的```next_head```和```next_tail```赋值赋上弧头的```first_in```和弧尾的```first_out```，将这个新输入的结点变为变为弧头结点的```first_in```和弧尾结点的```first_out```

```c
typedef struct orth_arc_node {
  int tail_vertex, head_vertex; //该弧的头尾结点
  int info;
  struct orth_arc_node *next_tail, *next_head;
} orth_arc_node;

typedef struct orth_vertex_node {
  int data;
  orth_arc_node *first_in, *first_out;
} orth_vertex_node;

typedef struct orth_graph {
  orth_vertex_node list[Max];
  int vertex_num, arc_num;
} orth_graph;
```

#### 多重邻接表

在邻接表中容易求得顶点和边的信息，但是每一条边的两个节点在不同的链表中不是很方便，对于需要找到表示同一条边的两个键点不方便；

感觉想把矩阵链表化；

```c
typedef struct adj_mult_edge_node {
  int mark;  //搜索标记
  int i_vertex, j_vertex;
  struct adj_mult_arc_node *i_next, *j_next;
} adj_mult_edge_node;

typedef struct adj_mult_vertex_node {
  int data;
  adj_mult_edge_node *first_edge;
} adj_mult_vertex_node;

typedef struct adj_mult_graph {
  adj_mult_vertex_node adj_mult_list[Max];
  int vertex_num, edge_num;
} adj_mult_graph;
```
#### 手绘

邻接矩阵、邻接表与图的相互转化

### 图的遍历

#### 深度优先

递归实现，用一个搜索标记预防环；循环所有没有被搜索过的结点调用```DFS```，```DFS```内部先是对结点修改搜索标志，然后再遍历所有连得到的结点判断时发被搜所过没有搜索过就调用DFS，最后进行访问操作；

也可以用栈实现，```while```循环判断是否栈为空，每次循环从栈中取出一个元素并且设置搜索标志如果还有没访问过的孩子就压回栈，将第一个孩子压入栈，继续循环，否则访问

#### 广度优先


使用一个队列，也用搜索标志防止环；先访问结点设置搜索标记（可以把第一个独立出来省一点点时间）并且将所有孩子（没有被搜索到过）都设置搜索标志压入队列中，每次循环从队列取出一个访问

### 应用

#### 最小生成树MST

##### Prim算法
描述+手绘

随便先选一个结点，将这个结点和其他结点分为两个集合一个是已选择集合一个是未选择集合，挑选出连接两个集合的最短的边，将这条边连到的未选择结合里的结点移入到已选择集合里，以此类推，直到所有结点都被移入已选择结点的集合中

适合比较**稠密**的图，因为是通过遍历所有一个集合内的顶点到另一个集合内的顶点的所有的边来选择最短的边,与顶点的点数相关，时间复杂度为$O(|V|^2)$
##### Kruskal算法
描述+手绘

把每个结点看作一个连通分量，挑选出连接不同连通分量之间最短的一条边，将两个连通分量合成为一个连通分量，以此类推，直到只有一个连通分量为止；

比较方便判断出是否最小生成树具有多种形态

适合比较**稀疏**的图，每次都选出不同连通分量里最小的边，采用堆来存放边，找到最小的边消耗时间为$O(log|E|)$，总的时间复杂度为$O(|E|log|E|)$

#### 最短路径

##### Dijkstra

文字描述，每一轮算法的执行过程

**单源最短路径**

先是挑选一个出发点，记录下从这个出发点开始，能到达的所有的结点，并且记录下代价，如果无法到达则记为无穷；选择一个最小的代价的结点，加入到出发点同一个集合当中；更新到达其他节点的代价，如果新加入的结点到达另一个结点消耗的代价加上到达新加入节点的代价小于原先的代价，则进行更新，同时更新到达该节点的路径；更新完成后再选一个代价最小的结点加入到出发点集合中，以此类推，直到所有结点都被加入；

##### Floyd

主要小题，文字描述

**多源最短路径**

使用一个邻接矩阵存储；

应该是一个动规算法；幸好这门课只叫数据结构，而不是叫数据结构与算法；

$dp^i$表示经过了第$i$个结点，每对结点之间的最短路径；

初始矩阵为邻接矩阵；
$$
dp^{-1}[i][j]=arc[i][j]
$$

从矩阵的左上角一个个正方形看下去（像是判断是否正定），从结点i到结点j的最短路径可能是经过新加入结点，也可能是没经过新加入的结点；动规方程如下
$$
dp^{k}[i][j]=min\lbrace (dp^{k-1}[i][k]+dp^{k-1}[k][j]),dp^{k}[i][j]\rbrace \\
0 \le k \le n-1
$$

#### 拓扑排序


给一张图，文字描述排序过程

应用，结点代表动作、有向边代表动作的先后顺序

Activity on Vertex

在图上一个个删除没有前驱结点的结点，对删除做记录（输出），就可以获得拓扑排序

使用一个栈，将入度为0的结点压入栈，有一个```count```变量，进入循环，从栈中弹出一个元素，```out[count++]=i```，记录弹出的结点，将这个结点指向的所有结点入度```-1```，再把所有入度为0的结点压入栈，如果```count```数目大于结点数目说明有环；

时间复杂度，采用邻接表时需要$O(|E|+|V|)$，采用邻接矩阵需要$O(|V|^2)$

#### 关键路径

文字描述

Activity on Edge

结点代表事件，边代表活动，边上的权值为活动开销的时间；只有顶点上的事件发生后能开始（出）边上的活动；所有（入）边上的活动完成后这个事件才能开始；

1. 事件最早发生时间```ve[k]```，从开始结点出发，$ve[k]=max\lbrace ve[j]+Weight(v_j,v_k) \rbrace$，$v_j$为$v_k$的所有前驱结点（可以在拓扑排序的基础上实现）；
2. 事件最晚发生事件```vl[k]```，从结束结点出发, $vl[k]=max\lbrace vl[j]-Weight(v_k,v_j) \rbrace$，$v_j$为$v_k$的所有后继结点（可以在逆拓扑排序的基础上实现）；```vl[0...n-1]=ve[n-1]```
3. 活动最早开始时间```ae[k]```，$ae[k]=ve[k]$，事件发生就可以开始；
4. 活动最晚开始时间```al[k]```，$ae[i]=vl[j]-weight(v_i,v_j)$，下一个时间最晚发生时间减去当前活动的代价为这个活动的最晚开始时间；
5. 活动的差额```d[k]```，$d[k]=al[k]-ae[j]$，如果它为0则为关键事件；

快速解题技巧，起点到终点的最长路径

## 查找
查找某一个关键词的概率为$P_i$一般$P_i=\frac{1}{n}$，找到该关键字所需要的比较次数为$C_i$
$$
ASL=\sum_{i=1}^{n}P_iC_i
$$

[简单的查找算法](/blogs/blog/easy_search.md)和[复杂的查找算法](/blogs/blog/complex_search.md)

注意ASL和时空复杂度的分析




### 应用

手绘

文字描述

使用某中查找算法找

## 排序

[排序算法](/blogs/blog/sort.md)

### 分析

比较次数

稳定性

时空复杂度

### 应用

手绘，代码复杂更容易手绘，代码简单可能算法题

文字描述

应用某种排序算法