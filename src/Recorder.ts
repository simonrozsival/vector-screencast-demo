import Recorder from '../../vector-screencast/src/lib/Recorder';

// import styles - uses webpack!
import '../../vector-screencast/src/theme/theme.less'

var recorder; // fight the GC!
window.onload = () => {
	recorder = new Recorder("recorder-root", {
		UploadURL: "/upload",
		Audio: {
			host: "localhost",
			port: 4000,
			path: "/",
			recordingWorkerPath: "/javascripts/audio-recording-worker.js"
		}
	});
};