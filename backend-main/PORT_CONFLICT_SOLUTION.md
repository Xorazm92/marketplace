# 🔧 Port 4000 Band Muammosini To'liq Hal Qilish

## 📋 Muammo

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:4000
```

Bu xato **port 4000 allaqachon boshqa jarayon tomonidan ishlatilayotganligini** bildiradi.

---

## ✅ Tezkor Yechim (1 daqiqa)

### Variant 1: Avtomatik tozalash va ishga tushirish
```bash
./start-server-safe.sh
```

Bu script:
1. ✅ Port 4000 ni tozalaydi
2. ✅ Eski jarayonlarni to'xtatadi
3. ✅ Serverni xavfsiz ishga tushiradi
4. ✅ Tekshiruv o'tkazadi

### Variant 2: Qo'lda tozalash
```bash
# 1. Portni tozalash
./stop-server.sh

# 2. Serverni ishga tushirish
npm run start:dev
```

### Variant 3: Boshqa port ishlatish
```bash
# Port 4001 da ishga tushirish
PORT=4001 npm run start:dev

# yoki
./start-server-safe.sh 4001
```

---

## 🔍 Diagnostika

### 1. Qaysi jarayon portni band qilgan?
```bash
lsof -i:4000
```

Natija:
```
COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   23u  IPv4 123456      0t0  TCP *:4000 (LISTEN)
```

### 2. Jarayon ma'lumotlarini ko'rish
```bash
ps aux | grep 12345
```

### 3. Barcha Node jarayonlarni ko'rish
```bash
ps aux | grep node
```

---

## 🛑 Jarayonlarni To'xtatish

### Usul 1: PID orqali (tavsiya etiladi)
```bash
# PID ni topish
PID=$(lsof -ti:4000)

# To'xtatish
kill -9 $PID
```

### Usul 2: Port orqali
```bash
lsof -ti:4000 | xargs kill -9
```

### Usul 3: Barcha NestJS jarayonlar
```bash
pkill -f "nest start"
```

### Usul 4: Bizning script
```bash
./stop-server.sh
```

---

## 🔧 Kengaytirilgan Yechimlar

### 1. PM2 orqali boshqarish (production uchun)

#### O'rnatish
```bash
npm install -g pm2
```

#### Ishga tushirish
```bash
# Development
pm2 start npm --name "inbola-backend" -- run start:dev

# Production
pm2 start npm --name "inbola-backend" -- run start:prod

# Ko'rish
pm2 list

# Loglar
pm2 logs inbola-backend

# To'xtatish
pm2 stop inbola-backend

# O'chirish
pm2 delete inbola-backend

# Qayta ishga tushirish
pm2 restart inbola-backend
```

### 2. Port o'zgarishini avtomatlashtirish

`.env` faylni yaratish:
```bash
cp .env.example .env
nano .env
```

Port o'zgartirish:
```env
PORT=4000
```

### 3. Docker orqali izolyatsiya qilish

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

```bash
# Build
docker build -t inbola-backend .

# Run
docker run -p 4000:4000 inbola-backend

# Stop
docker stop $(docker ps -q --filter ancestor=inbola-backend)
```

---

## 🚨 Keng Tarqalgan Muammolar va Yechimlar

### 1. Port tozalangandan keyin ham xato
**Sabab:** Jarayon to'liq to'xtamagan

**Yechim:**
```bash
# Kuchli to'xtatish
sudo killall -9 node

# yoki
sudo lsof -ti:4000 | xargs sudo kill -9
```

### 2. Multiple terminals da server ishga tushirilgan
**Sabab:** Bir nechta terminal oynasida `npm run start:dev` ishlatilgan

**Yechim:**
```bash
# Barcha terminallarni yoping yoki
pkill -f "nest start"
pkill -f "ts-node"
```

### 3. Zombie process
**Sabab:** Parent process to'xtagan, lekin child process davom etmoqda

**Yechim:**
```bash
# Barcha zombie processlarni topish
ps aux | grep 'Z'

# Sistema qayta yuklash (oxirgi chora)
sudo reboot
```

### 4. Port permission denied
**Sabab:** 1024 dan kichik portlar uchun sudo kerak

**Yechim:**
```bash
# Boshqa port ishlatish (>1024)
PORT=4000 npm run start:dev

# yoki sudo bilan
sudo PORT=4000 npm run start:dev
```

### 5. Firewall blokirovka qilgan
**Sabab:** UFW yoki iptables port 4000 ni blokirovka qilgan

**Yechim:**
```bash
# UFW uchun
sudo ufw allow 4000

# iptables uchun
sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
```

---

## 📊 Monitoring va Logging

### 1. Real-time monitoring
```bash
# Port 4000 ni kuzatish
watch -n 1 'lsof -i:4000'

# CPU/Memory usage
top -p $(lsof -ti:4000)
```

### 2. Loglarni ko'rish
```bash
# npm logs
npm run start:dev 2>&1 | tee server.log

# Faqat xatolar
npm run start:dev 2>&1 | grep ERROR

# Tail -f
tail -f server.log
```

### 3. Systemd service (production)
```ini
# /etc/systemd/system/inbola-backend.service
[Unit]
Description=INBOLA Backend Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/npm run start:prod
Restart=always
Environment=NODE_ENV=production
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable va start
sudo systemctl enable inbola-backend
sudo systemctl start inbola-backend

# Status
sudo systemctl status inbola-backend

# Logs
sudo journalctl -u inbola-backend -f
```

---

## 🎯 Best Practices

### 1. Development
```bash
# Har doim bir terminal ishlatish
# Port conflict oldini olish uchun start scriptdan foydalanish
./start-server-safe.sh
```

### 2. Production
```bash
# PM2 yoki systemd ishlatish
# Environment variables ishlatish
# Health check endpoint sozlash
# Auto-restart konfiguratsiyasi
```

### 3. Port Management
```bash
# 4000 - Backend
# 3000 - Frontend  
# 5432 - PostgreSQL
# 6379 - Redis
# Har bir servis uchun alohida port
```

---

## 📚 Foydali Buyruqlar

```bash
# Barcha portlarni ko'rish
netstat -tulpn | grep LISTEN

# Node jarayonlarni ko'rish
ps aux | grep node

# Port bo'shligini tekshirish
nc -zv localhost 4000

# Portni tozalash (barcha usullar)
lsof -ti:4000 | xargs kill -9
pkill -f "nest start"
killall node

# Server xavfsiz ishga tushirish
./start-server-safe.sh

# Server to'xtatish
./stop-server.sh

# Port tekshirish
./fix-port-issue.sh
```

---

## 🆘 Yordam

### Muammo hal bo'lmasa:

1. **Loglarni tekshiring:**
   ```bash
   cat server.log | grep ERROR
   ```

2. **Sistema holatini tekshiring:**
   ```bash
   df -h  # Disk space
   free -h  # Memory
   top  # CPU usage
   ```

3. **Port conflict scriptni ishga tushiring:**
   ```bash
   ./fix-port-issue.sh
   ```

4. **Oxirgi chora - Sistema qayta yuklash:**
   ```bash
   sudo reboot
   ```

---

## ✅ Tekshiruv Checklist

- [ ] Port 4000 bo'sh
- [ ] Eski jarayonlar to'xtatilgan
- [ ] .env fayli to'g'ri sozlangan
- [ ] Database ulanishi ishlayapti
- [ ] Server muvaffaqiyatli ishga tushdi
- [ ] Health endpoint javob bermoqda
- [ ] API documentation ochilmoqda
- [ ] Loglar xatosiz

---

**Yaratilgan:** 2025-09-30  
**Versiya:** 1.0.0  
**Status:** ✅ Production Ready
