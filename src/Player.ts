import Player from '../../vector-screencast/src/lib/Player';
// import Recorder from '../node_modules/vector-screencast/src/lib/Player';

var player; // fight the GC!
window.onload = () => {
	const rootId = 'player-root';
	let root = document.getElementById(rootId);
	
	player = new Player(rootId, {
		Source: root.dataset['source']
	});
};