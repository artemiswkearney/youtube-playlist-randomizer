///<reference types="gapi.client.youtube" />
///<reference types="gapi" />

import YTPlayer from 'yt-player';

async function getShuffle(playlistIDs : string[]) : Promise<string[]> {
	let pageToken : string | undefined = undefined;
	let videoIDs : string[] = [];
	for (const playlistId of playlistIDs) {
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
		pageToken = undefined;
	}
	// shuffle
	let temp : string;
	for (let i = videoIDs.length; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		temp = videoIDs[i];
		videoIDs[i] = videoIDs[j];
		videoIDs[j] = temp;
	}
	console.log(`found ${videoIDs.length} videos`);
	return videoIDs;
}

async function shuffle(playlists : string[], nextButton : HTMLButtonElement) {
	let videos : string[] = [];
	let player = new YTPlayer('#player');
	let index = 0;
	const playNext = async () => {
		if (index >= videos.length) {
			videos = await getShuffle(playlists);
			index = 0;
		}
		console.log(`playing ${videos[index]}`);
		player.load(videos[index++], true);
	};
	await playNext();
	player.on('unplayable', playNext);
	player.on('error', playNext);
	player.on('ended', playNext);

	nextButton.onclick = playNext;
	nextButton.disabled = false;
}

gapi.load("client", async () => {
	console.log("gapi client loaded")
	gapi.client.setApiKey("AIzaSyDXRIzo7LqFvo3QTdirH0Zgvqmxk1MyjM0");

	await gapi.client.load('youtube', 'v3');
	console.log("gapi youtube loaded");

	const playlistsField = document.getElementById("playlists") as HTMLTextAreaElement;
	const selectButton = document.getElementById("selectPlaylists") as HTMLButtonElement;
	const nextButton = document.getElementById("next") as HTMLButtonElement;

	selectButton.onclick = async () => {
		// this *should* parse either a raw playlist ID or a playlist URL
		const regex = /(?:^.*(?:youtu.be\/|list=))?([^#\&\?]*).*/;
		const newline = /\r\n|\r|\n/;
		const lines = playlistsField.value.split(newline);
		const ids = lines.map(line => line.match(regex))
			.map(match => (match && match[1]) || "")
			.filter(id => !!id);
		shuffle(ids, nextButton);
	};
	selectButton.disabled = false;
});
