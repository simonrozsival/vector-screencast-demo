import AudioServer from '../../vector-screencast-audioserver/src/AudioRecording';

// init the server
let server = new AudioServer({	
	hostName: 'http://localhost:3000',
	port: 4000,
	path: '/',
	outputDir: './public/recordings',
	formats: [ 'mp3' ],
	deleteWav: true
});

// start listening for clients
server.Start();