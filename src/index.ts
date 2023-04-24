import dotenv from 'dotenv';
//
import db from './config/db';
import { app } from './config/app';

process.env.NODE_ENV = 'development';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.dev' });
}

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
}

db();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
