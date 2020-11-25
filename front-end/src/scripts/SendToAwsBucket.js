// React imports
import React from 'react';

// AWS s3 imports
import S3FileUpload from 'react-s3';

// Modularized script to upload an image to the AWS bucket and return the
// URI to the image
export function sendToAwsBucket(e)
{
	const bucketPayload = {
		bucketName : process.env.AWS_BUCKET_NAME,
		dirName : process.env.AWS_RECIPE_IMG_DIR,
		region : process.env.AWS_REGION_NAME,
		accessKeyId : process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
	};

	// create a filename with the date and timestamp
	var filename = Date.now().toString() + ':' + Date.getTime().toString();
	var object_uri = '';

	S3FileUpload.uploadFile(e.target.files[0], bucketPayload)
		.then((data) => {object_uri = data.location})
		.catch((error) => {object_uri = 'FAILED TO UPLOAD'});

	return object_uri;
}
