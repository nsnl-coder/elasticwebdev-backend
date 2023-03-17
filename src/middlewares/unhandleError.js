const onUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err);
    server.close(() => {
      process.exit(1);
    });
  });
};

const onSigTerm = (server) => {
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
};

const onUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1);
  });
};

module.exports = { onUncaughtException, onSigTerm, onUnhandledRejection };
