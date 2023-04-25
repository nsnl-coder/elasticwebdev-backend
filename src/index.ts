import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env.dev' });
}

// dont move import above env variables config
import db from './config/db';
import { app } from './config/app';
db();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
