import routes from './routes/cloudant.routes.js'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
import 'dotenv/config'
const app = express();

// Middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan('combined')); // Logging HTTP requests
app.use(helmet()); // Add security headers to responses

routes(app)
app.use(express.static(path.join(__dirname, 'dist')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
