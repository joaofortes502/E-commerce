FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia o código da aplicação
COPY . .

# Cria diretório para o banco SQLite (se necessário)
RUN mkdir -p database

# Expõe a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]