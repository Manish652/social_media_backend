# 1️⃣ Base image with Node 23 (matches your version)
FROM node:23.7-alpine

# 2️⃣ Set working directory inside the container
WORKDIR /app

# 3️⃣ Copy package files first (for caching)
COPY package*.json ./

# 4️⃣ Install all dependencies (including dev for nodemon)
RUN npm install

# 5️⃣ Copy rest of the backend code
COPY . .

# 6️⃣ Expose port
EXPOSE 5000

# 7️⃣ Start server using nodemon (for development)
CMD ["npx", "nodemon", "index.js"]
