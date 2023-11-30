const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

class streamableDownloader {
    constructor() {
        this.url = 'https://streamable.com/';
    }

    getInfo = async (id) => new Promise(async (resolve, reject) => {
        let response = await fetch(this.url + id);
        if (response.status !== 200) reject('Video not found');
        let html = await response.text();
        let $ = cheerio.load(html);

        let videoTitle = $('meta[property="og:title"]').attr('content');
        let videoThumbnail = $('meta[property="og:image"]').attr('content');

        resolve({
            videoLink: this.url + id,
            videoId: id,
            videoTitle,
            videoThumbnail
        });
    });


    convertMp4 = async (id, {
        download = false
    }) => new Promise(async (resolve, reject) => {
        let response = await fetch(this.url + id);
        if (response.status !== 200) reject('Video not found');
        let html = await response.text();
        let $ = cheerio.load(html);

        let videoUrl = $('meta[property="og:video:url"]').attr('content');

        let video = await fetch(videoUrl);
        let videoBuffer = await video.buffer();

        if (download) {
            try {
                fs.writeFile(id + '.mp4', videoBuffer, () => { })
            } catch (err) {
                return reject(err);
            }

            resolve({
                success: true,
                message: 'Video downloaded',
                exportedTo: id + '.mp4',
                path: process.cwd() + '\\' + id + '.mp4'
            })
        } else {
            resolve(videoBuffer);
        }

    });
}

async function main() {
    let videoId = '<video id here>';
    const streamable = new streamableDownloader();
    streamable.convertMp4(videoId, {
        download: true
    }).then((res) => {
        if (res?.success) {
            console.log(`Video downloaded successfully, saved to ${res.path}`)
        } else {
            console.log(`Video downloaded as buffer, and not saved to disk.`)
        }
    }).catch(err => console.error(err))

    streamable.getInfo(videoId).then((res) => {
        console.log(res);
    }).catch(err => console.error(err))

}


main();