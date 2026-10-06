const express = require('express')
const app = express()
const dotenv = require('dotenv')

dotenv.config()

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from a directory
app.use(express.static('public'));

app.set('view engine', 'ejs')
app.set('views', './views');

const PORT = process.env.PORT
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

// Route that renders a template
app.get('/', (req, res) => {
  const data = {
    title: 'Google Maps to GPRMC',
    message: 'Hello from EJS!',
    items: ['Item 1', 'Item 2', 'Item 3'],
    apiKey: GOOGLE_API_KEY
  };
  // Renders the views/index.ejs template
  res.render('maps', data);
});

app.get('/hello', (req, res) => res.send('Hello World!'))

app.get('/map', function(req, res) {
    console.log('Return index.html')
    res.sendFile(__dirname + '/public/index.html');
});

// Catch all other routes
// app.all('*', (req, res) => {
//   res.status(404).send('404 - Page not found');
// });

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))