const express = require('express');
const path = require('path');

const app = new express();
const port = process.env.PORT || 3334;


app.use('/', express.static(path.join(__dirname, 'build')));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'))
});

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
});
