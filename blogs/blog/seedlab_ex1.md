---
title: SeedLab ex1 Secret-Key Encryption Lab
date: 2024-01-09
categories:
 - 网络安全
cover: /images/covers/red.png
---



## Task1:FrequencyAnalysis


```python
def frequency_analysis(ciphertext_path): #密文频率
    res = {chr(i): 0 for i in range(ord('a'), ord('z')+1)}
    with open(ciphertext_path) as f:
        for line in f.readlines():
            for ch in line:
                if ch.isalpha():
                   res[ch.lower()]+=1
    sorted_res = sorted(res.items(),key=lambda x:x[1],reverse=True)
    return (item[0] for item in sorted_res)

def decrypt_mapping(frequency_order):
    words_freq="etaoinshrdlucmwfygpbvkxjqz"
    res = dict(zip(frequency_order, words_freq))
    return res

def main():
    frequency_order=frequency_analysis('../in/ciphertext.txt')
    decrypt_map=decrypt_mapping(frequency_order)
    with open('../out/out.txt',mode='a') as out_file:
        with open('../in/ciphertext.txt') as in_file:
            for line in in_file.readlines():
                for ch in line:
                    if ch.isalpha():
                        out_file.write(decrypt_map[ch])
                    else:
                        out_file.write(ch)

if __name__ == '__main__':
    main()
```



## Task2: Encryption using Different Ciphers and Modes

- 文本加密 ```openssl enc -aes-128-cbc -e -in ./in/plain.txt -out ./out/task2_cipher.bin -K 00112233445566778889aabbccddeeff -iv 0011223344556677```
- 文本解密 ```openssl enc -aes-128-cbc -d -in ./out/task2_cipher.bin -out ./out/task2_out.bin -K 00112233445566778889aabbccddeeff -iv 0011223344556677```

## Task3: Encryption Mode– ECB vs. CBC


### 图片加密解密

- aes-128-cbc 加密 ```openssl enc -aes-128-cbc -in ./in/pic_original.bmp -out ./out/task3_pic_cbc_enc.bmp -e -K 00112233445566778889aabbccddeeff -iv 0011223344556677```

- aes-128-ecb 加密 ```openssl enc -aes-128-ecb -in ./in/pic_original.bmp -out ./out/task3_pic_ecb_enc.bmp -e -K 00112233445566778889aabbccddeeff```

``` bash
head -c 54 ./in/pic_original.bmp > ./out/task3_pic_header
tail -c +55 ./out/task3_pic_cbc_enc.bmp > ./out/task3_cbc_body
tail -c +55 ./out/task3_pic_ecb_enc.bmp > ./out/task3_ecb_body
cat ./out/task3_pic_header ./out/task3_cbc_body > ./out/task3_pic_cbc_out.bmp
cat ./out/task3_pic_header ./out/task3_ecb_body > ./out/task3_pic_ecb_out.bmp
```

## Task4: Padding

### 是否padding

在加密文件时，使用ECB、CBC、CFB和OFB等模式，每种模式对填充的需求不同。以下是对这些模式及其填充需求的简要说明：

- ECB模式（Electronic Codebook）：
填充需求：需要填充。
原因：ECB模式将明文分成块，每个块单独加密，因此如果最后一个块的长度不足加密算法要求的块大小，就需要进行填充。

- CBC模式（Cipher Block Chaining）：
填充需求：需要填充。
原因：CBC模式中，每个块的加密依赖于前一个块的加密结果，因此如果最后一个块的长度不足，就需要填充以保持块的完整性。

- CFB模式（Cipher Feedback）：
填充需求：不需要填充。
原因：CFB模式中，密文流直接作为输入用于下一个块的加密，因此可以处理不足块大小的最后一个块而无需填充。

- OFB模式（Output Feedback）：
填充需求：不需要填充。
原因：OFB模式类似于CFB，它将前一个块的加密结果作为输入用于加密下一个块，不依赖于明文的结构。因此，不需要填充来保持块大小一致性。

### 创建文件

```bash
echo -n "01234" > ./out/task4_f5.txt
echo -n "0123456789" > ./out/task4_f10.txt
echo -n "0123456789abcdef" > ./out/task4_f16.txt
```


### ecb

#### 加密

先用AES加密算法（128位密钥，ECB模式）加密这些文件，然后解密这些密文（选择解密时不去除padding的选项），观察解密后各个文件的尺寸大小


```bash
openssl enc -aes-128-ecb -e -in ./out/task4_f5.txt -out ./out/task4_5_ecb.txt -K 00112233445566778889aabbccddeeff
openssl enc -aes-128-ecb -e -in ./out/task4_f10.txt -out ./out/task4_10_ecb.txt -K 00112233445566778889aabbccddeeff
openssl enc -aes-128-ecb -e -in ./out/task4_f16.txt -out ./out/task4_16_ecb.txt -K 00112233445566778889aabbccddeeff
```


#### 解密

```bash
openssl enc -aes-128-ecb -d -in ./out/task4_5_ecb.txt -out ./out/task4_5_ecb_out.txt -K 00112233445566778889aabbccddeeff -nopad
openssl enc -aes-128-ecb -d -in ./out/task4_10_ecb.txt -out ./out/task4_10_ecb_out.txt -K 00112233445566778889aabbccddeeff -nopad
openssl enc -aes-128-ecb -d -in ./out/task4_16_ecb.txt -out ./out/task4_16_ecb_out.txt -K 00112233445566778889aabbccddeeff -nopad
```

#### 查看

```bash
xxd task4_5_ecb_out.txt
xxd task4_10_ecb_out.txt
xxd task4_16_ecb_out.txt
```

### cbc

#### 加密

先用AES加密算法（128位密钥，CBC模式）加密这些文件，然后解密这些密文（选择解密时不去除padding的选项），观察解密后各个文件的尺寸大小


```bash
openssl enc -aes-128-cbc -e -in ./out/task4_f5.txt -out ./out/task4_5_cbc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cbc -e -in ./out/task4_f10.txt -out ./out/task4_10_cbc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cbc -e -in ./out/task4_f16.txt -out ./out/task4_16_cbc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```
#### 解密

```bash
openssl enc -aes-128-cbc -d -in ./out/task4_5_cbc.txt -out ./out/task4_5_cbc_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-cbc -d -in ./out/task4_10_cbc.txt -out ./out/task4_10_cbc_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-cbc -d -in ./out/task4_16_cbc.txt -out ./out/task4_16_cbc_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
```

#### 查看

```bash
xxd task4_5_cbc_out.txt
xxd task4_10_cbc_out.txt
xxd task4_16_cbc_out.txt
```

### cfb

#### 加密

先用AES加密算法（128位密钥，CFB模式）加密这些文件，然后解密这些密文（选择解密时不去除padding的选项），观察解密后各个文件的尺寸大小


```bash
openssl enc -aes-128-cfb -e -in ./out/task4_f5.txt -out ./out/task4_5_cfb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cfb -e -in ./out/task4_f10.txt -out ./out/task4_10_cfb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cfb -e -in ./out/task4_f16.txt -out ./out/task4_16_cfb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```

#### 解密

```bash
openssl enc -aes-128-cfb -d -in ./out/task4_5_cfb.txt -out ./out/task4_5_cfb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-cfb -d -in ./out/task4_10_cfb.txt -out ./out/task4_10_cfb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-cfb -d -in ./out/task4_16_cfb.txt -out ./out/task4_16_cfb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
```

#### 查看

```bash
xxd task4_5_cfb_out.txt
xxd task4_10_cfb_out.txt
xxd task4_16_cfb_out.txt
```

### ofb

#### 加密

先用AES加密算法（128位密钥，OFB模式）加密这些文件，然后解密这些密文（选择解密时不去除padding的选项），观察解密后各个文件的尺寸大小


```bash
openssl enc -aes-128-ofb -e -in ./out/task4_f5.txt -out ./out/task4_5_ofb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-ofb -e -in ./out/task4_f10.txt -out ./out/task4_10_ofb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-ofb -e -in ./out/task4_f16.txt -out ./out/task4_16_ofb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```

#### 解密

```bash
openssl enc -aes-128-ofb -d -in ./out/task4_5_ofb.txt -out ./out/task4_5_ofb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-ofb -d -in ./out/task4_10_ofb.txt -out ./out/task4_10_ofb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
openssl enc -aes-128-ofb -d -in ./out/task4_16_ofb.txt -out ./out/task4_16_ofb_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
```

#### 查看

```bash
xxd task4_5_ofb_out.txt
xxd task4_10_ofb_out.txt
xxd task4_16_ofb_out.txt
```


## Task5: Error Propagation– Corrupted Cipher Text

### 生成文本

```python
res = ""
for i in range(1024):
    res+=str(i%10)
print(res)
```

```bash
python generate.py > ../out/task5.txt
```

### 加密

用AES加密算法（128位密钥，ECB, CBC, CFB, or OFB模式）加密这个文件

```bash
openssl enc -aes-128-ecb -e -in ./out/task5.txt -out ./out/task5_ecb_enc.txt -K 00112233445566778889aabbccddeeff 
openssl enc -aes-128-cbc -e -in ./out/task5.txt -out ./out/task5_cbc_enc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cfb -e -in ./out/task5.txt -out ./out/task5_cfb_enc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-ofb -e -in ./out/task5.txt -out ./out/task5_ofb_enc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```

### 修改

使用vscode 中的hexeditor工具修改密文中第55个字节中的1个bit

### 解密

```bash
openssl enc -aes-128-ecb -d -in ./out/task5_ecb_enc.txt -out ./out/task5_ecb_error_out.txt -K 00112233445566778889aabbccddeeff 
openssl enc -aes-128-cbc -d -in ./out/task5_cbc_enc.txt -out ./out/task5_cbc_error_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cfb -d -in ./out/task5_cfb_enc.txt -out ./out/task5_cfb_error_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-ofb -d -in ./out/task5_ofb_enc.txt -out ./out/task5_ofb_error_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```

## Task6: Initial Vector (IV) and Common Mistakes

###  IV Experiment

```bash
openssl enc -aes-128-cbc -e -in ./out/task6.txt -out ./out/task6_enc_iv1.txt -K  00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cbc -e -in ./out/task6.txt -out ./out/task6_enc_iv2.txt -K  00112233445566778889aabbccddeeff -iv 7766554433221100
openssl enc -aes-128-cbc -e -in ./out/task6.txt -out ./out/task6_enc_iv1_re.txt -K  00112233445566778889aabbccddeeff -iv 0011223344556677
```


### Common Mistake: Use the Same IV

```bash
openssl enc -aes-128-ofb -e -in ./out/task6.txt -out ./out/task6_enc0_ofb_.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-ofb -e -in ./out/task6_.txt -out ./out/task6_enc1_ofb.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
```


```python
# XOR two bytearrays
def xor(first, second):
   return bytearray(x^y for x,y in zip(first, second))

P_1 = bytes("0123456789", 'utf-8')
C_1 = bytearray.fromhex("9dbcca7bebab49d81119")
C_2 = bytearray.fromhex("94b5cf7eeaaa4cdd1810")

tmp = xor(P_1,C_1) #?得出加密过程
P_2 = xor(tmp,C_2)

print(P_2.decode())
```


AES_OFB(P_1 xor iv) = C_1
AES_OFB(P_2 xor iv) = C_2

(P_1 xor C_1) xor C_2 = P_2



### Common Mistake: Use a Predictable IV



1. C = AES_CBC(P xor iv)
2. C = AES_CBC(P' xor next_iv)
3. P' = P xor iv xor next_iv
4. P' xor next_iv = P xor iv xor next_iv xor next_iv = P xor iv
```bash
openssl enc -aes-128-cbc -e -in ./out/task6_2.txt -out ./out/task6_2_enc.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677
openssl enc -aes-128-cbc -d -in ./out/task6_2_enc.txt -out ./out/task6_2_out.txt -K 00112233445566778889aabbccddeeff -iv 0011223344556677 -nopad
```
得到Yes的形式 

获取P'

```python

```

## task7

words里遍历，加密，密文相同则是key，pad用#填充

```python
from Crypto.Cipher import AES
import base64

# 由于python Crtpto包iv长度锁定为16bytes 所以就自己重新弄了密文

def pad(text): # 填充函数
    count = len(text.encode('utf-8'))
    add = 16 - (count % 16)
    entext = text + ('#' * add)
    return entext

def encrypt(plaintext, key, iv):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    cipher_text = cipher.encrypt(plaintext.encode('utf-8'))
    res = str(base64.b64encode(cipher_text), encoding="utf8")
    return res



def main():
    iv = '0011223344556677'
    plaintext = 'This is a top secret.'
    iv_ = iv.encode('utf-8')
    plaintext_ = pad(plaintext)
    ciphertext =encrypt(plaintext_,pad('bluestocking').encode('utf-8'),iv_)
    print('plaintext:',plaintext)
    print('iv:',iv)
    print('plaintext_:',plaintext_)
    print('iv_:',iv_)
    print('ciphertext:',ciphertext)
    
    with open('../in/words.txt') as f:
        for line in f.readlines():
            word=line.strip()
            key = pad(word).encode('utf-8')
            tmp = encrypt(plaintext_,key,iv_)
            if ciphertext == tmp:
                print(word)

if __name__ == '__main__':
    main()

```