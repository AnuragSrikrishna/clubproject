# MongoDB Configuration Options

## Option 1: With Basic Authentication (Current)
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin123

## Option 2: No Authentication (Alternative)
To disable authentication completely, update docker-compose.yml:

```yaml
mongo-express:
  image: mongo-express:1.0.0
  container_name: college-clubs-mongo-express
  restart: unless-stopped
  ports:
    - "8081:8081"
  environment:
    ME_CONFIG_MONGODB_ADMINUSERNAME: admin
    ME_CONFIG_MONGODB_ADMINPASSWORD: admin123
    ME_CONFIG_MONGODB_URL: mongodb://admin:admin123@mongodb:27017/
    ME_CONFIG_BASICAUTH: false
  depends_on:
    - mongodb
  networks:
    - college-clubs-network
```

## Troubleshooting Access Issues

### If you get "Unauthorized" error:
1. **Try these credentials**:
   - Username: `admin`
   - Password: `admin123`

2. **Or check container logs**:
   ```bash
   docker logs college-clubs-mongo-express
   ```

3. **Restart Mongo Express**:
   ```bash
   docker-compose restart mongo-express
   ```

4. **Complete recreation**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Direct MongoDB Connection Test:
```bash
# Test MongoDB connection directly
docker exec -it college-clubs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Switch to your database
use college_clubs

# List collections
show collections

# View users
db.users.find().pretty()
```

## Alternative: Use Different MongoDB Admin Tools

### 1. MongoDB Compass (Desktop)
- Download: https://www.mongodb.com/products/compass
- Connection string: `mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin`

### 2. Studio 3T (Desktop)
- Connection: localhost:27017
- Username: admin
- Password: admin123
- Auth Database: admin

### 3. Command Line Access
```bash
# Access MongoDB shell directly
docker exec -it college-clubs-mongodb mongosh college_clubs -u admin -p admin123 --authenticationDatabase admin
```
