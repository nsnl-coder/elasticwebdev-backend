import mongoose from 'mongoose';

const db = () => {
  if (process.env.CONNECTION_STRING) {
    mongoose
      .connect(process.env.CONNECTION_STRING)
      .then(() => {
        console.log('Mongodb Database Connected');
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log('Can not find connection string');
  }
};

export default db;
