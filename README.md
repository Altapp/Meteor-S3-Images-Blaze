# Amazon S3 Uploader
If you need this package to work pre-0.8.0 you will have to use version 1.2.5. S3 provides a simple way of uploading files to the Amazon S3 service. This is useful for uploading images and files that you want accesible to the public. S3 is built on [Knox](https://github.com/LearnBoost/knox), a module that becomes available server-side after installing this package.

This is a fork of the original work from @Lepozepo and additional work by @Donflopez.

## Installation

``` sh
$ meteor add altapp:s3-images-blaze
```

## How to use

### Step 1
Define your Amazon S3 credentials. SERVER SIDE.

``` javascript
Meteor.call("S3config",{
	key: 'amazonKey',
	secret: 'amazonSecret',
	bucket: 'bucketName',
	directory: '/subfolder/' //This is optional, defaults to root
});
```

### Step 2
Create an S3 input with a callback. CLIENT SIDE.

``` handlebars
{{#S3 callback="callbackFunction" height=300 width=300 cropSquare='true'}}
	<input type="file" accept="image/*">
{{/S3}}
```
This will resize uploaded image to max height and width provider, and crop to a centered square if `cropSquare='true'`.

There are 3 session variables provided:

``` javascript
Session.get('uploading'); //bool, if an upload is in progress

//two lists of URLs are provided to differentiate between all uploads and uploads the user 
//wishes to keep; this upkeep must be handled by your code.
Session.get('S3urls'); //array, list of uploaded URLs in this session, must be reset manually
Session.get('S3uploads'); //array, list of uploaded URLs in this session, must be reset manually

``` 

### Step 3
Create a callback function that will handle what to do with the generated URL. SERVER SIDE.

``` javascript
Meteor.methods({
	callbackFunction:function(url,context){
		console.log('Add '+url+' to the id of '+context);
	}
});
```

## Create your Amazon S3
For all of this to work you need to create an aws account. On their website create navigate to S3 and create a bucket. Navigate to your bucket and on the top right side you'll see your account name. Click it and go to Security Credentials. Once you're in Security Credentials create a new access key under the Access Keys (Access Key ID and Secret Access Key) tab. This is the info you will use for the first step of this plug. Go back to your bucket and select the properties OF THE BUCKET, not a file. Under Static Website Hosting you can Enable website hosting, to do that first upload a blank index.html file and then enable it. YOU'RE NOT DONE.

You need to set permissions so that everyone can see what's in there. Under the Permissions tab click Edit CORS Configuration and paste this:

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
    </CORSRule>
</CORSConfiguration>
```

Save it. Now click Edit bucket policy and paste this, REPLACE THE BUCKET NAME WITH YOUR OWN:

``` javascript
{
	"Version": "2008-10-17",
	"Statement": [
		{
			"Sid": "AllowPublicRead",
			"Effect": "Allow",
			"Principal": {
				"AWS": "*"
			},
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::YOURBUCKETNAMEHERE/*"
		}
	]
}
```

Enjoy, this took me a long time to figure out and I'm sharing it so that nobody has to go through all that.

## Notes

I have no clue how to make a progress bar but it'll happen someday. I was able to make that work by modifying [meteor-file](https://github.com/EventedMind/meteor-file) BUT I wasn't able to use it in [Modulus](https://modulus.io/) because their cloud storage service isn't public (so I ended up having to read the file as a base64 image which sucked for performance).