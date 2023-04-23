const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '.env.public' });

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.dev' });
}

if (!fs.existsSync('.env.prod')) {
  console.log('You forgot to include production environment variables');
  return;
}

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
}

require('./utils/email');

// require db
const db = require('./config/db');
db();

// require express app
const { app } = require('./config/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
