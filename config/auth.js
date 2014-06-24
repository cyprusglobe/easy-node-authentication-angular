// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: 'your-secret-clientID-here', // your App ID
		'clientSecret' 	: 'your-client-secret-here', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '837639568766-grum46fhc65qqku25k9vh1m9tnpo6jhc.apps.googleusercontent.com',
		'clientSecret' 	: 'CLiB3z4aKyXvcCDSmIJpMQoS',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};
