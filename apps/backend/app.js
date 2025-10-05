const express = require('express');
const connectDB = require('./db');
const blogRoutes = require('./routes/blog.routes');
const uploadRoutes = require('./routes/upload.routes');
const trendsRoutes = require('./routes/trends.routes');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
require('./cronJobs');

const app = express();

// Connect to the database
connectDB();

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5000, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 10 minutes.',
});

app.use(helmet());
app.use('/api/', limiter);

// List of allowed domains for CORS
const allowedDomains = [
    'https://radiorogue.com',
    'https://api.radiorogue.com',
    'http://localhost:5000', // Add localhost for development
    'http://localhost:3000'  // Add frontend dev server
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedDomains.indexOf(origin) !== -1 || !origin) {
            // Allow requests from allowed domains or requests without origin (e.g., server-side, Postman)
            callback(null, true);
        } else {
            // Block requests from other origins
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Ensure OPTIONS is allowed for preflight requests
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies, etc.)
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to RadioRogue!');
});

app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/trends', trendsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy has blocked the request.' });
    }
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
