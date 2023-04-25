import dotenv from 'dotenv';
//
import db from './config/db';
import { app } from './config/app';

db();

dotenv.config({ path: '.env' });

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env.dev' });
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
