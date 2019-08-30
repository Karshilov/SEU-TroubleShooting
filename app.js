module.exports = app => {
  app.once('server', server => {
    // websocket
    
  });
  app.on('error', (err, ctx) => {
    // report error
  });
  app.on('request', ctx => {
    // log receive request
    ctx.logger.info();
  });
  app.on('response', ctx => {
    
  });
};
