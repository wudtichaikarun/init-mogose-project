import mongoose from 'mongoose';

export default uri =>
  new Promise((resolve, reject) => {
    mongoose.set('debug', true);
    mongoose.set('useCreateIndex', true);
    mongoose.connection
      .on('error', error => reject(error))
      .on('close', () =>
        console.info(`database connection close.`)
      )
      .once('open', () => resolve(mongoose.connections[0]));
    mongoose.connect(uri, { useNewUrlParser: true });
  });
