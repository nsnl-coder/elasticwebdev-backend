import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
// dotenv.config({ path: '.env.prod' });
//
import db from './config/db';
import { app } from './config/app';

db();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});
