const express = require('express');
const app = express();

app.use(express.static('static'));

app.listen(3333,  () => console.log('Server started!'));
