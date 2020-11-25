// AWS s3 imports
import AWS from 'aws-sdk';

const { AWS_ACCESS_ID } = process.env;
const { AWS_SECRET_KEY } = process.env;

// Modularized script to upload an image to the AWS bucket and return the
// URI to the image
export function sendToAwsBucket(file)
{
	const accessInfo = {
		accessKeyId : AWS_ACCESS_ID,
		secretAccessKey : AWS_SECRET_KEY
	};

	const bucketInfo = {
		params: {
			Bucket: 'browniepointsbucket'
		},

		region: 'us-east-2'
	}

	// URI prefix for objects to be stored in bucket
	const BUCKET_URI = 'https://browniepointsbucket.s3.us-east-2.amazonaws.com/';

	// configure the access data for the bucket
	AWS.config.update(accessInfo);
	const bucket = new AWS.S3(bucketInfo);

	// get file prefix type
	var suffix = '';
	var type = '';

	// check if jpeg
	if (file.type === 'image/jpeg')
	{
		suffix = '.jpg';
		type = 'image/jpeg';
	}

	// check if png
	else if (file.type === 'image/png')
	{
		suffix = '.png';
		type = 'image/png';
	}

	else
	{
		return 'Invalid filetype';
	}

	// generate a unique filename
	var date = new Date();
	var filename = date.getFullYear() + '-' + date.getDay() + '-' + date.getMonth() + '_' + date.getTime() + suffix;

	// generate a new file with the new name
	var blob = file.slice(0, file.size, type);
	file = new File([blob], filename, {type : type});
	var progress = 0;

	const params = {
		ACL: 'public-read',
    Key: file.name,
    ContentType: file.type,
    Body: file,
	};

	bucket.putObject(params)
		.on('httpUploadProgress', (evt) => {
			// that's how you can keep track of your upload progress
			progress = Math.round((evt.loaded / evt.total) * 100)
			})
		.send((err) => {
			if (err)
			{
				return 'Upload Failed';
			}
		});

	return (BUCKET_URI + filename);
}
