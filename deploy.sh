cd /express-app 
git pull
npm install --ignore mongodb-memory-server nodemon supertest
npm run build
npm run afterBuild
pm2 stop all
pm2 delete all
pm2 start build/index.js --name=express-app
