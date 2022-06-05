---
title: MSP430G2553UART通信实验
date: 2022-06-05
categories:
 - 实验报告 
tags:
 - 嵌入式
 - uart
cover: /images/covers/kumiko.png
---

久美子的性格真是糟糕呢

三年级TV化定辣！

<!-- more -->

## 嵌入式实验三：UART通信实验


### 实验目的

1. 认识UART是什么技术
2. 分析样例代码，了解MSP430如何使用TIMER_A实现UART
3. 修改样例代码实现半双工UART，收到为1则打开绿灯，收到0则打开红灯，使用4800波特，8个数据位，2个停止位

### 实验设计

1. 样例代码，样例代码大致是先定义了定时器的输入和输出引脚用来获取获取和发送数据，设定波特率。初始化定时器，使用TAC_0管理发送功能设置，TAC_1管理接收功能。对于发送的字符串，一个个字符发送添加空格位和错误位。对接受的字符串改了下判断的位置加上了个周期的二分之一，不是很确定这是干嘛的，猜测是什么曼切斯特编码，在中间变化。
2. 使用4800波特，将样例代码设置波特率部分参数化
3. 两个停止位，添加一个1，总的发送位数则变为11位。
4. 收到为1则打开绿灯，收到0则打开红灯，简化原本的字符判断，是判断0和1，其余重置。
5. 实现半双工，刚开始想的是在同一个中断里进行判断，就打算用TAC_2，但是没找到它对应的输入或者输出引脚就放弃了，后面想直接用一个标志位flag进行判断就好了，然后就意识到他原本就有中断的使能位，TAC_0的使能位原本是关闭的，优先级较高，在发送是会打开中断，接受端原本是打开中断的，那么在发送中断打开后关闭接收中断，再发送完成后打开接收中断，就实现了不能同时进行收发了。


### 程序源代码

```c
#include <msp430.h>

//------------------------------------------------------------------------------
// Hardware-related definitions
//------------------------------------------------------------------------------
#define UART_TXD 0x02 // TXD on P1.1 (Timer0_A.OUT0)
#define UART_RXD 0x04 // RXD on P1.2 (Timer0_A.CCI1A)
#define LED0 BIT0
#define LED1 BIT6

//------------------------------------------------------------------------------
// Conditions for 9600 Baud SW UART, SMCLK = 1MHz
// 每 1M / 9600 Hz 发送 1 波特 1s发送9600波特;此处1波特为1比特好像，下面每发送一比特数据就加一个UART_TBIT
//------------------------------------------------------------------------------
#define BAUD_RATE 4800
#define UART_TBIT_DIV_2 (1000000 / (BAUD_RATE * 2))
#define UART_TBIT (1000000 / BAUD_RATE)

//------------------------------------------------------------------------------
// Global variables used for full-duplex UART communication
//------------------------------------------------------------------------------
unsigned int txData;    // UART internal variable for TX
unsigned char rxBuffer; // Received UART character

//------------------------------------------------------------------------------
// Function prototypes
//------------------------------------------------------------------------------
void TimerA_UART_init(void);
void TimerA_UART_tx(unsigned char byte);
void TimerA_UART_print(char *string);

//------------------------------------------------------------------------------
// main()
//------------------------------------------------------------------------------
int main(void) {
  WDTCTL = WDTPW + WDTHOLD; // Stop watchdog timer
  if (CALBC1_1MHZ == 0xFF)  // If calibration constant erased
  {
    while (1)
      ; // do not load, trap CPU!!
  }

  DCOCTL = 0;            // Select lowest DCOx and MODx settings
  BCSCTL1 = CALBC1_1MHZ; // Set DCOCLK to 1MHz
  DCOCTL = CALDCO_1MHZ;

  P1OUT = 0x00;                // Initialize all GPIO , Port 1 Output
  P1SEL = UART_TXD + UART_RXD; // Timer function for TXD/RXD pins , Port 1 Selection
  P1DIR = 0xFF & ~UART_RXD;    // Set all pins but RXD to output , Port 1 Direction
  P2OUT = 0x00;
  P2SEL = 0x00;
  P2DIR = 0xFF;

  __enable_interrupt();

  TimerA_UART_init(); // Start Timer_A UART
  TimerA_UART_print("G2553 TimerA UART\r\n");
  TimerA_UART_print("READY.\r\n");

  for (;;) {
    // Wait for incoming character
    __bis_SR_register(LPM0_bits); // 设置低功耗模式

    if (rxBuffer == 0x30) { //收到字符为0的情况 与&的话在P1OUT为0不合适 或|的话在P1OUT有数据的时候不合适
      P1OUT = LED0;
    } else if (rxBuffer == 0x31) { //收到字符为1的情况
      P1OUT = LED1;
    } else
      P1OUT &= 0; // P1.0

    // Echo received character

    TimerA_UART_tx(rxBuffer);
  }
}
//------------------------------------------------------------------------------
// Function configures Timer_A for full-duplex UART operation
//------------------------------------------------------------------------------
void TimerA_UART_init(void) {
  TACCTL0 = OUT;                    // Set TXD Idle as Mark = '1' 输出模式为0 OUT位置1 闲置时输出1
  TACCTL1 = SCS + CM1 + CAP + CCIE; // Sync, Neg Edge, Capture, Int
                                    // 捕捉模式用于记录时间事件，用于速度估计和时间测量。
                                    // 发生捕捉，定时器TACCR1的值被复制，CCIFG被置位
  TACTL = TASSEL_2 + MC_2;          // Timer_A SMCLK, start in continuous mode 增至0FFFFh
}

//------------------------------------------------------------------------------
// Prints a string over using the Timer_A UART
//------------------------------------------------------------------------------
void TimerA_UART_print(char *string) {
  while (*string) {
    TimerA_UART_tx(*string++);
  }
}

//------------------------------------------------------------------------------
// Outputs one byte using the Timer_A UART
//------------------------------------------------------------------------------
void TimerA_UART_tx(unsigned char byte) {
  while (TACCTL0 & CCIE) {

  };                        // Ensure last char got TX'd
  TACCR0 = TAR;             // Current state of TA counter
  TACCR0 += UART_TBIT;      // One bit time till first bit
                            // 从TAR计到TAR+UART_TBIT
  TACCTL1 &= ~CCIE;         // 关闭中断，停止接受
  TACCTL0 = OUTMOD0 + CCIE; // Set TXD on EQU0 OUTMOD0(计数到达TACCR0 输出被置位), enable Int

  txData = byte;   // Load global variable
  txData |= 0x300; // Add mark stop bit to TXData
  txData <<= 1;    // Add space start bit
                   // 原本添加上去的1位于第九位左移后位于第十位
  // txData 共10位 左移产生的0用来作为传输的开始标志位，1作为传输结束位，中间8位为传输的数据
}

//------------------------------------------------------------------------------
// Timer_A UART - Transmit Interrupt Handler
// CCR0优先级最 占用A0_VECTOR
// TIMER_A设置为连续模式
// 连续模式可以用于产生独立的时间间隔和输出频率，每个时间间隔完成时就会产生一个中断信号。在中断服务里添加下一个时间间隔到TARRC0中。
// ------------------------------------------------------------------------------
#pragma vector = TIMER0_A0_VECTOR
__interrupt void Timer_A0_ISR(void) {
  static unsigned char txBitCnt = 11;

  TACCR0 += UART_TBIT; // Add Offset to CCRx
  if (txBitCnt == 0) { // All bits TXed? 结束判断 发送完1
    TACCTL0 &= ~CCIE;  // All bits TXed, disable interrupt
    txBitCnt = 11;     // Re-load bit counter
    TACCTL1 |= CCIE;   // 打开中断，开始接受
  } else {
    // 传输1byte数据会先进入第二个分支，初始为OUTMOD0先被设置为OUTMOD2(计数到达TACCR0 输出被切换)
    // 如果后续遇到了1bit就OUTMOD置为OUTMOD0
    if (txData & 0x01) {   // 大概是发送1还是发送0的判断
      TACCTL0 &= ~OUTMOD2; // TX Mark '1'  计数到TACCR0置位输出为1
    } else {
      TACCTL0 |= OUTMOD2; // TX Space '0' 计树到TACCR0切换输出从1变为0，刚开始是闲置为1
    }
    txData >>= 1;
    txBitCnt--;
  }
}
//------------------------------------------------------------------------------
// Timer_A UART - Receive Interrupt Handler
// CCR1，CCR2，溢出中断占用A1_VECTOR
//------------------------------------------------------------------------------
#pragma vector = TIMER0_A1_VECTOR
__interrupt void Timer_A1_ISR(void) {
  static unsigned char rxBitCnt = 8; //接受字符大小为8位
  static unsigned char rxData = 0;   //初始化接受数据

  switch (__even_in_range(TA0IV, TA0IV_TAIFG)) { // Use calculated branching(提高switch语句的效率)
  case TA0IV_TACCR1:                             // TACCR1 CCIFG - UART RX
    TACCR1 += UART_TBIT;                         // Add Offset to CCRx
                                                 // 同样是连续模式产生独立时间间隔的中断
    if (TACCTL1 & CAP) {                         // Capture mode = start bit edge
      TACCTL1 &= ~CAP;                           // Switch capture to compare mode
      TACCR1 +=
          UART_TBIT_DIV_2; // Point CCRx to middle of D0
                           // 改变为比较模式后也许是比较的位置法生变化，猜测由于是曼切斯特编码传输所以得加半个周期调整一下？
    } else {
      rxData >>= 1;
      if (TACCTL1 &
          SCCI) { // Get bit waiting in receive latch 比较模式将输入信号CCI锁存到SCCI 如果输入信号CCI为1则保存到rxData中
        rxData |= 0x80; // 右移后最左边一位置1
      }
      rxBitCnt--;
      if (rxBitCnt == 0) {                    // All bits RXed?恢复设置
        rxBuffer = rxData;                    // Store in global variable
        rxBitCnt = 8;                         // Re-load bit counter
        TACCTL1 |= CAP;                       // Switch compare to capture mode
        __bic_SR_register_on_exit(LPM0_bits); // Clear LPM0 bits from 0(SR)
      }
    }
    break;
  }
}
//------------------------------------------------------------------------------

```
### 程序结论


