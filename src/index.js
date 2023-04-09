const dotenv = require('dotenv');
dotenv.config();
require('./utils/email');

// require db
const db = require('./config/db');
db();

// require express app
const { app } = require('./config/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
