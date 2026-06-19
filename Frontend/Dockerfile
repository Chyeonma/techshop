# Sử dụng Node.js bản nhẹ (alpine) cho môi trường phát triển (Dev)
FROM node:20-alpine

# Cài đặt thư mục làm việc mặc định bên trong container
WORKDIR /app

# Copy các file quản lý thư viện vào trước để tận dụng Docker Cache
COPY package*.json ./

# Cài đặt toàn bộ thư viện (node_modules)
RUN npm install

# Copy toàn bộ mã nguồn của thư mục Frontend vào trong container
COPY . .

# Mở cổng mạng 5173 (Port mặc định của Vite)
EXPOSE 5173

# Chạy ứng dụng React (Vite).
# Cờ "--host 0.0.0.0" rất quan trọng để có thể truy cập được từ bên ngoài trình duyệt máy tính của bạn.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
