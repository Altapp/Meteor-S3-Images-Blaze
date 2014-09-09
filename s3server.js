Knox = Npm.require("knox");
var Future = Npm.require('fibers/future');

var knox;
var S3;

Meteor.methods({
	S3config:function(obj){
		knox = Knox.createClient(obj);
		S3 = {directory:obj.directory || "/"};
	},
	S3upload:function(file, thumb, context,callback){
		var future = new Future();

		var extension = (file.name).match(/\.[0-9a-z]{1,5}$/i);
		var uuid = Meteor.uuid();
		
		file.name = uuid+extension;
		thumb.name = uuid+'_thumb'+extension;
		var path = S3.directory+file.name;
		var pathThumb = S3.directory+thumb.name;

		var buffer = new Buffer(file.data);
		var bufferThumb = new Buffer(thumb.data);

		knox.putBuffer(buffer,path,{"Content-Type":file.type,"Content-Length":buffer.length},function(e,r){
			if(!e){
				knox.putBuffer(bufferThumb,pathThumb,{"Content-Type":thumb.type,"Content-Length":bufferThumb.length},function(e,r){
					if(!e){
						future.return(path);
					} else {
						console.log(e);
					}
				});
			} else {
				console.log(e);
			}
		});

		if(future.wait() && callback){
			var url = knox.https(future.wait());
			Meteor.call(callback,url,context);
			return url;
		}
	},
	S3delete:function(path, callback){
		knox.deleteFile(path, function(e,r) {
			if(e){
				console.log(e);
			}	else if(callback){
				Meteor.call(callback);
			}
		});
	}
});
