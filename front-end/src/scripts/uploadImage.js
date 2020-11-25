import AWS from 'aws-sdk';

// Uploads file to aws bucket
function uploadImage(file)
{
	/*
		Incoming:
		{
			file : file object
		}

		Outgoing:
		{
			success : bool,
			uri : string
		}
	*/

	const BUCKET_URI = 'https://browniepointsbucket.s3.us-east-2.amazonaws.com/';

	var returnPackage = {
		success : false,
		uri : ''
	};

	const accessInfo = {
		accessKeyId : process.env.REACT_APP_AWS_ACCESS_ID,
		secretAccessKey : process.env.REACT_APP_AWS_SECRET_KEY
	};

	const bucketInfo = {
		params: {
			Bucket: 'browniepointsbucket'
		},

		region: 'us-east-2'
	}

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
		returnPackage.error = 'Invalid file';
		return returnPackage;
	}

	// generate a unique filename
	var date = new Date();
	var filename = date.getFullYear() + '-' + date.getDay() + '-' + date.getMonth() + '_' + date.getTime() + suffix;

	// generate a new file with the new name
	var blob = file.slice(0, file.size, type);
	file = new File([blob], filename, {type : type});
	// var progress = 0;

	const params = {
		ACL: 'public-read',
    Key: file.name,
    ContentType: file.type,
    Body: file,
	};

	bucket.putObject(params)
		.on('httpUploadProgress', (evt) => {
			// // that's how you can keep track of your upload progress
			// progress = Math.round((evt.loaded / evt.total) * 100)
			})
		.send((err) => {
			// Error handling (if any)
		});

	returnPackage.success = true;
	returnPackage.uri = (BUCKET_URI + filename);

	return returnPackage;
}


export default uploadImage;
