///<reference types="gapi.client.youtube" />
///<reference types="gapi" />

import YTPlayer from 'yt-player';

async function getShuffle(playlistId : string) : Promise<string[]> {
	let pageToken : string | undefined = undefined;
	let videoIDs : string[] = [];
	while (true) {
		let page = await gapi.client.youtube.playlistItems.list({
			playlistId,
			part: "contentDetails",
			maxResults: 50,
			pageToken: pageToken,
		});
		videoIDs = videoIDs.concat((page.result.items ?? []).map(item => item.contentDetails?.videoId ?? "").filter(v => !!v));
		if (page.result.nextPageToken) {
			// no idea why this assertion is needed
			pageToken = page.result.nextPageToken as string;
		}
		else break;
	}
	// shuffle
	for (let i = videoIDs.length; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		videoIDs[i], videoIDs[j] = videoIDs[j], videoIDs[i];
	}
	console.log(`found ${videoIDs.length} videos`);
	return videoIDs;
}

gapi.load("client", () => {
	console.log("gapi client loaded")
	gapi.client.setApiKey("AIzaSyDXRIzo7LqFvo3QTdirH0Zgvqmxk1MyjM0");
	gapi.client.load('youtube', 'v3', async () => {
		console.log("gapi youtube loaded")
		let videos : string[] = [];
		let player = new YTPlayer('#player');
		let index = 0;
		const playNext = async () => {
			if (index >= videos.length) {
				videos = await getShuffle("PLdD9nAspvXi7yD6j2AV-1Do21d4oNdTPi");
				index = 0;
			}
			console.log(`playing ${videos[index]}`);
			player.load(videos[index++], true);
		};
		await playNext();
		player.on('unplayable', playNext);
		player.on('error', playNext);
		player.on('ended', playNext);
		console.log("callbacks set");
	});
});
