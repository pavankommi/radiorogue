// services/upload.service.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK with environment variables
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadFile = async (file) => {
    const fileStream = fs.createReadStream(file.filepath);
    const contentType = file.mimetype || 'application/octet-stream';

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `uploads/${file.originalFilename}`,
        Body: fileStream,
        ContentType: contentType,
        ACL: 'public-read',
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
    } catch (error) {
        throw new Error('Error uploading file to S3');
    }
};

module.exports = { uploadFile };
