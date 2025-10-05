const express = require('express');
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // To generate unique filenames
require('dotenv').config();

const router = express.Router();

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Handle file upload
router.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, 'public/temp'),
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing the file:', err);
            return res.status(500).json({ error: 'Error parsing the file' });
        }

        const file = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;
        if (!file) {
            console.error('No file uploaded or file not found in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file type (e.g., only allow images)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            console.error('Unsupported file type:', file.mimetype);
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        try {
            const uniqueFilename = `${uuidv4()}-${file.originalFilename}`;
            const fileStream = fs.createReadStream(file.filepath);
            const contentType = file.mimetype || 'application/octet-stream';
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `uploads/${uniqueFilename}`, // Use unique filename
                Body: fileStream,
                ContentType: contentType,
                // ACL: 'public-read', // Removed as ACLs are not supported
            };

            const uploadResult = await s3.upload(params).promise();

            // Clean up the temporary file after upload
            fs.unlink(file.filepath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });

            res.status(200).json({ url: uploadResult.Location });
        } catch (uploadError) {
            console.error('Error uploading the file to S3:', uploadError);
            res.status(500).json({ error: 'Error uploading the file to S3' });
        }
    });
});

module.exports = router;
