$username = "iwan" 
$password = "xiaohui20001206" 
$secure = $password | ConvertTo-SecureString -AsPlainText -Force 
$cred = New-Object System.Management.Automation.PSCredential($username, $secure) 
New-SSHSession -ComputerName 47.98.63.97 -Credential $cred -AcceptKey 
Invoke-SSHCommand -SessionId 0 -Command "cd /home/iwan/apps/iwan_blog_vuepress/;git pull;"   #pull新代码
# Invoke-SSHCommand -SessionId 0 -Command "cd /home/iwan/apps/iwan_blog_vuepress/;yarn install;"   #更新资源文件
Invoke-SSHCommand -SessionId 0 -Command "cd /home/iwan/apps/iwan_blog_vuepress/;npm run build;"  #更新前端页面
Remove-SSHSession -Index 0 -Verbose