import Player from '../../vector-screencast/src/lib/Player';

// import styles - uses webpack!
import '../../vector-screencast/src/theme/theme.less'

var player; // fight the GC!
window.onload = () => {
	const rootId = 'player-root';
	let root = document.getElementById(rootId);
	
	player = new Player(rootId, {
		Source: root.dataset['source'],
		Autoplay: true,
		ShowControls: true
	});
};