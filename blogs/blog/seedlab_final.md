---
title: TCP协议半连接的端口扫描程序
date: 2024-01-10
categories:
 - 网络安全
cover: /images/covers/violet.png
---

散发眼镜学妹太可爱辣，在学妹的一声声sennpai中沦陷，可惜是真路人女主

<!--  -->
## 题目要求
1. 实现TCP协议半连接扫描程序，包括发送探测数据包、接收和分析对方机器返回的响应数据包。
2. 开发语言不限。（如果采用C语言，可以基于Libpcap和Libnet函数库。）

## 题目分析

### 端口扫描

就是看看目标机器上那些端口是开放的，哪些是关闭的

### 半连接

半连接（Half-Open）是指TCP协议中的三次握手过程中的某一阶段（建立一般的连接

正常的TCP连接

1. 客户端向服务器发送SYN请求
2. 服务器接收到SYN请求后，向客户端回复一个SYN+ACK
3. 客户端在接收到服务器发送的SYN+ACK后，发送一个ACK给服务器

半连接扫描就是不去建立完整的TCP连接，而是在第3步不发送ACK，而是发送RST。因为当收到服务器放的SYN+ACK时，就已经能够确定这个端口时开放的，只需发送RST断开这个连接，让服务器不要再重发了。若收到的时RST这个端口则是关闭的。

## 程序设计

语言不限，c好看就写c了。

**输入**：源ip（伪造），目标ip，起始端口，结束端口。

在之前数据包的嗅探和伪造中实验的基础上做，思路大致是端口循环，然后伪造包、捕获包、判断，想想还是挺简单。

### 坑

1. TCP包的校验得自己写，忘记了，发出去收不着
2. ip地址的网络字节序和主机字节序转化，```inet_ntoa()```，函数返回的是一个指针，他是个静态变量，所以多次调用会导致被覆盖的问题，调用完用```strcpy```把数据存下来
3. 速度问题，原本的想法是将发送数据包和接收数据包设计成两个函数，先调用发送再调用捕获，但是呢，运行的时候发现只能捕获到开放端口的数据包（看wireshark发现的，原因是会重传，捕获到的不是第一个包是重传的包）。所以就猜是运行速度问题，当SYN已经发送出去，而且服务器已经发送了RST或者SYN+ACK了但是捕获报的函数还没执行到捕获阶段，导致的丢失。解决方法就是再捕获的函数中，打开监听后调用发送数据包的函数，紧接着执行```pcap_loop```。

### code
```c
#include <arpa/inet.h>
#include <linux/if_packet.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <pcap.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>

#define SRC_PORT 1234
#define SYN 0x02
#define RST 0x04
#define ACK 0x10
#define NON 0

/* Ethernet header */
struct ethheader {
  u_char ether_dhost[6]; /* destination host address */
  u_char ether_shost[6]; /* source host address */
  u_short ether_type;    /* IP? ARP? RARP? etc */
};

/* IP Header */
struct ipheader {
  unsigned char iph_ihl : 4,       // IP header length
      iph_ver : 4;                 // IP version
  unsigned char iph_tos;           // Type of service
  unsigned short int iph_len;      // IP Packet length (data + header)
  unsigned short int iph_ident;    // Identification
  unsigned short int iph_flag : 3, // Fragmentation flags
      iph_offset : 13;             // Flags offset
  unsigned char iph_ttl;           // Time to Live
  unsigned char iph_protocol;      // Protocol type
  unsigned short int iph_chksum;   // IP datagram checksum
  struct in_addr iph_sourceip;     // Source IP address
  struct in_addr iph_destip;       // Destination IP address
};

/* TCP Header */
struct tcpheader {
  u_short th_sport; /* source port */
  u_short th_dport; /* destination port */
  uint32_t th_seq;  /* sequence number */
  uint32_t th_ack;  /* acknowledgement number */
  // u_char th_offset; /* data offset, rsvd */
  u_char th_offx2; /* head len and offset*/
  u_char th_flags; /* control flags */
  u_short th_win;  /* window */
  u_short th_sum;  /* checksum */
  u_short th_urp;  /* urgent pointer */
};

/* Psuedo TCP header */
struct pseudo_tcp {
  unsigned saddr, daddr;
  unsigned char mbz;
  unsigned char ptcl;
  unsigned short tcpl;
  struct tcpheader tcp;
  char payload[1500];
};

int get_rand() {
  srand(time(NULL));
  return rand();
}
// 计算16位无符号整数数组的校验和
unsigned short in_cksum(unsigned short *buf, int length) {
  unsigned short *w = buf;
  int nleft = length;
  int sum = 0;
  unsigned short temp = 0;

  /*
   * 该算法使用一个32位的累加器（sum），将连续的16位字添加到其中，
   * 最后，将所有进位位从高16位折叠回低16位。
   */
  while (nleft > 1) {
    sum += *w++;
    nleft -= 2;
  }

  // 处理末尾的奇字节（如果有）
  if (nleft == 1) {
    *(u_char *)(&temp) = *(u_char *)w;
    sum += temp;
  }

  // 将从高16位到低16位的进位加回
  sum = (sum >> 16) + (sum & 0xffff); // 将高16位加到低16位
  sum += (sum >> 16);                 // 加上进位
  return (unsigned short)(~sum);
}

// 计算TCP校验和的函数
unsigned short calculate_tcp_checksum(struct ipheader *ip) {
  // 获取TCP头部
  struct tcpheader *tcp =
      (struct tcpheader *)((u_char *)ip + sizeof(struct ipheader));

  // 计算TCP长度
  int tcp_len = ntohs(ip->iph_len) - sizeof(struct ipheader);

  // 为校验和计算构建伪TCP头部
  struct pseudo_tcp p_tcp;
  memset(&p_tcp, 0x0, sizeof(struct pseudo_tcp));

  p_tcp.saddr = ip->iph_sourceip.s_addr;
  p_tcp.daddr = ip->iph_destip.s_addr;
  p_tcp.mbz = 0;
  p_tcp.ptcl = IPPROTO_TCP;
  p_tcp.tcpl = htons(tcp_len);
  memcpy(&p_tcp.tcp, tcp, tcp_len);

  // 调用in_cksum函数计算伪TCP头部的校验和
  return (unsigned short)in_cksum((unsigned short *)&p_tcp, tcp_len + 12);
}

void send_raw_ip_packet(struct ipheader *ip) {
  struct sockaddr_in dest_info;
  int enable = 1;

  //创建套接字 IPv 类型RAW 协议ICMP
  int sock = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);
  // IP_HDRINCL 自定义头部
  setsockopt(sock, IPPROTO_IP, IP_HDRINCL, &enable, sizeof(enable));

  // 目标地址信息
  dest_info.sin_family = AF_INET;
  dest_info.sin_addr = ip->iph_destip;

  //发送
  sendto(sock, ip, ntohs(ip->iph_len), 0, (struct sockaddr *)&dest_info,
         sizeof(dest_info));

  close(sock);
}

void send_packet(char *src_ip, char *dst_ip, int src_port, int dst_port,
                 int syn, int rst, int seq, int ack) {
  // printf("src_ip:%s\t", src_ip);
  // printf("dst_ip:%s\t", dst_ip);
  // printf("src_port:%d\t", src_port);
  // printf("dst_port:%d\t", dst_port);
  char buffer[2000];
  memset(buffer, 0, 2000);

  struct ipheader *ip = (struct ipheader *)buffer;
  struct tcpheader *tcp =
      (struct tcpheader *)(buffer + sizeof(struct ipheader));

  // data

  // tcpheader
  tcp->th_sport = htons(src_port);
  tcp->th_dport = htons(dst_port);
  tcp->th_seq = htonl(seq);
  tcp->th_ack = htonl(ack);
  tcp->th_offx2 = 0x50;
  if (syn == SYN) {
    tcp->th_flags = 0x02;
  }
  if (rst == RST) {
    tcp->th_flags = 0x04;
  }
  tcp->th_win = htons(20000);
  tcp->th_sum = 0;

  // ipheader
  ip->iph_ver = 4;
  ip->iph_ihl = 5;
  ip->iph_ttl = 20;
  ip->iph_sourceip.s_addr = inet_addr(src_ip);
  ip->iph_destip.s_addr = inet_addr(dst_ip);
  ip->iph_protocol = IPPROTO_TCP;
  ip->iph_len = htons(sizeof(struct ipheader) + (sizeof(struct tcpheader)));

  //校验
  tcp->th_sum = calculate_tcp_checksum(ip);

  send_raw_ip_packet(ip);
}
void got_packet(u_char *args, const struct pcap_pkthdr *header,
                const u_char *packet) {

  printf("\033[0;35mGOT PACKET!\n\033[0m");
  struct ethheader *eth = (struct ethheader *)packet;
  if (ntohs(eth->ether_type) == 0x0800) { // 0x0800 is IP type
    struct ipheader *ip =
        (struct ipheader *)(packet + sizeof(struct ethheader));
    struct tcpheader *tcp =
        (struct tcpheader *)(packet + sizeof(struct ethheader) +
                             sizeof(struct ipheader));
    if (tcp->th_flags == SYN || tcp->th_flags == SYN + ACK) {
      printf("\033[0;32mFLAGS:SYN+ACK!端口为开放状态!\n\033[0m");

      //获取tcp包中的seq和ack，返回的RST报文seq为ack ack为seq+1
      int seq = ntohl(tcp->th_seq);
      int ack = ntohl(tcp->th_ack);
      int ans_seq = ack;
      int ans_ack = seq + 1;
      int ans_dst_port = ntohs(tcp->th_sport);

      // inet_ntoa静态指针存在被覆盖的问题 所以先开辟地址再复制
      char *src_ip = (char *)malloc(sizeof(char) * 20);
      char *dst_ip = (char *)malloc(sizeof(char) * 20);
      char *tmp = inet_ntoa(ip->iph_destip);
      strcpy(src_ip, tmp);
      inet_ntoa(ip->iph_sourceip);
      strcpy(dst_ip, tmp);

      printf("\033[0;35mSend RST Packet!\n\033[0m");
      send_packet(src_ip, dst_ip, SRC_PORT, ans_dst_port, NON, RST, ans_seq,
                  ans_ack); //发送RST
    }
    if (tcp->th_flags == RST + ACK) {
      printf("\033[0;31mFLAGS:RST!端口未开放!\n\033[0m");
    }
  }
}

void send_and_capture_packet(char *src_ip, char *dst_ip, int dst_port) {
  pcap_t *handle;                // pcap 会话句柄
  char errbuf[PCAP_ERRBUF_SIZE]; //储错误消息的字符数组
  struct bpf_program fp;         //存储过滤器规则的结构体
  char filter_exp[100];

  // 格式化IP地址和端口号为BPF过滤器规则字符串
  sprintf(filter_exp, "src host %s and src port %d and tcp", dst_ip, dst_port);
  bpf_u_int32 net; //存储网络地址的变量

  // 打开一个 live pcap 会话。"br-9539db83f0ea" 是网络接口的名称，BUFSIZ
  // 是捕获缓冲区的大小，1 表示设置为混杂模式，1000 表示超时设置为1秒。
  handle = pcap_open_live("br-9539db83f0ea", BUFSIZ, 1, 1000, errbuf);

  // 编译过滤表达式
  pcap_compile(handle, &fp, filter_exp, 0, net);
  if (pcap_setfilter(handle, &fp) != 0) {
    pcap_perror(handle, "Error:");
    exit(EXIT_FAILURE);
  }

  // 发送SYN包
  printf("\033[0;35mSend SYN Packet!\n\033[0m");
  send_packet(src_ip, dst_ip, SRC_PORT, dst_port, SYN, NON, get_rand(), 0);

  // 捕获循环中捕获一个数据包
  pcap_loop(handle, 1, got_packet, NULL);

  pcap_close(handle); // Close the handle
}

void scan_port(char *src_ip, char *dst_ip, int dst_port) {
  // send_packet(src_ip, dst_ip, SRC_PORT, dst_port, SYN, NON, get_rand(), 0);
  // 原本的想法是先发送再接受，但是存在速度不匹配的问题，对方传回来的包已经到了但是还没开始监听
  send_and_capture_packet(src_ip, dst_ip, dst_port);
}

int main(int argc,
         char *argv[]) { //输入格式 a.out src_ip dst_ip start_port end_port

  char *src_ip = argv[1];
  char *dst_ip = argv[2];
  char *start_port_str = argv[3];
  char *end_port_str = argv[4];
  int start_port = atoi(start_port_str);
  int end_port = atoi(end_port_str);

  printf("\033[0;33msrc_ip:%s\n", src_ip);
  printf("dst_ip:%s\n", dst_ip);
  printf("start_port:%d\n", start_port);
  printf("end_port:%d\n\033[0m", end_port);

  // send_raw_ip_packet(ip);
  for (int i = start_port; i <= end_port; ++i) {
    printf("\033[0;34mport:%d\n\033[0m", i);
    scan_port(src_ip, dst_ip, i);
    printf("\n");
  }
}
```