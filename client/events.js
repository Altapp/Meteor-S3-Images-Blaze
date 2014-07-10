Template.S3.events({
	'change input[type=file]': function (e,helper) {
		var context = this || {};

		if(helper.data && _.has(helper.data,"callback")){
			var callback = helper.data.callback;
		} else {
			console.log("S3 Error: Helper Block needs a callback function to run");
			return
		}

		var files = e.currentTarget.files;
		_.each(files,function(file){
			var reader = new FileReader;
			var fileData = {
				name:file.name,
				size:file.size,
				type:file.type
			};


			Session.set('uploading', true);
			if (!file.type.match(/image.*/) && !helper.data.width)
			{
				Session.set('uploading', false);
			}
			else
			{
				reader.onload = function (e) {
					
					//CANVAS
					var canvas = document.createElement('canvas');
					var img = document.createElement("img");
					img.src = e.target.result;
					img.onload = function (e) {
						var ctx = canvas.getContext("2d");
						ctx.drawImage(img, 0, 0);

						var MAX_WIDTH = helper.data.width;
						var MAX_HEIGHT = helper.data.height;
						var width = img.width;
						var height = img.height;

						if (width > height) {
						  if (width > MAX_WIDTH) {
						    height *= MAX_WIDTH / width;
						    width = MAX_WIDTH;
						  }
						} else {
						  if (height > MAX_HEIGHT) {
						    width *= MAX_HEIGHT / height;
						    height = MAX_HEIGHT;
						  }
						}
						canvas.width = width;
						canvas.height = height;
						ctx = canvas.getContext("2d");
						ctx.drawImage(img, 0, 0, width, height);

						var dataUrl = canvas.toDataURL(fileData.type);
						var binaryImg = atob(dataUrl.slice(dataUrl.indexOf('base64')+7,dataUrl.length));
						var length = binaryImg.length;
						var ab = new ArrayBuffer(length);
						var ua = new Uint8Array(ab);
						for (var i = 0; i < length; i++){
							ua[i] = binaryImg.charCodeAt(i);
						}

						fileData.data = ua;
						Meteor.call("S3upload",fileData,context,callback, function(err, url){
							var uploads = Session.get('S3uploads');
							if(uploads.indexOf(url) == -1)
								uploads.push(url);						
							Session.set('S3uploads', uploads);
							Session.set('S3url', url);
							Session.set('uploading', false);
						});
					}
				};
				reader.readAsDataURL(file);
			}


		});
	}
});