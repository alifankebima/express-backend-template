const { google } = require('googleapis');
const fs = require('fs');

// Google drive credentials and scopes
const auth = new google.auth.GoogleAuth({
    credentials: {
        "type": process.env.GOOGLE_DRIVE_TYPE,
        "project_id": process.env.GOOGLE_DRIVE_PROJECT_ID,
        "private_key_id": process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
        "private_key": process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        "client_id": process.env.GOOGLE_DRIVE_CLIENT_ID,
        "auth_uri": process.env.GOOGLE_DRIVE_AUTH_URI,
        "token_uri": process.env.GOOGLE_DRIVE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.GOOGLE_DRIVE_AUTH_PROVIDER,
        "client_x509_cert_url": process.env.GOOGLE_DRIVE_CLIENT_URL
    },
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.scripts',
        'https://www.googleapis.com/auth/drive.metadata',
    ]
});

// Hit google drive API
const driveService = google.drive({
    version: 'v3',
    auth: auth,
});

const uploadImage = async (imageFile) => {
    const response = await driveService.files.create({
        // File name and google drive parent folder
        resource: {
            name: imageFile.filename,
            parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER],
        },

        // File to be uploaded
        media: {
            mimeType: imageFile.mimeType,
            body: fs.createReadStream(imageFile.path),
        },

        // Return field
        fields: 'id',
    });

    return response.data;
}

const deleteImage = async (imageId) =>   {
    const response = await driveService.files.delete({
        // Require image id to be deleted
        fileId: imageId,
    });

    return response.data;
}

const updateImage = async (newImageFile, oldImageId) => {
    const response = await driveService.files.update({
        // Require image id to be replaced
        fileId: oldImageId,

        // File to be uploaded
        media: {
            mimeType: newImageFile.mimeType,
            body: fs.createReadStream(newImageFile.path),
        },

        // Return field
        fields: 'id',
    });

    return response.data;
}

module.exports = {
    uploadImage,
    updateImage,
    deleteImage
}