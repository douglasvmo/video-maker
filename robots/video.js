const gm = require('gm').subClass({ imageMagick: true });
const videoshow = require('videoshow');
const state = require('./state');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
let ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

async function robot() {
  const content = state.load();

  await convertAllImages(content);
  // await createAllSentenceImage(content);
  await createYouTubethumbnail();
  await renderVideoWithNode(content);

  state.save(content);

  async function convertAllImages(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await convertImage(sentenceIndex);
    }
  }

  async function convertImage(sentenceIndex) {
    return new Promise((resolve, reject) => {
      const inputFile = `./content/${sentenceIndex}-original.png[0]`;
      const outputFile = `./content/${sentenceIndex}-converted.png`;
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputFile)
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-blur', '0x9')
        .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }
          console.log(`> [video-robot] Image converted: ${outputFile}`);
          resolve();
        });
    });
  }
  async function createAllSentenceImage(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await createSentenceImage(
        sentenceIndex,
        content.sentences[sentenceIndex].text
      );
    }
  }
  async function createSentenceImage(sentenceIndex, sentenceText) {
    return new Promise((resolve, reject) => {
      const outputFile = `./content/${sentenceIndex}-sentence.png`;
      const templateSettings = {
        0: {
          size: '1920x400',
          gravity: 'center',
        },
        1: {
          size: '1920x1080',
          gravity: 'center',
        },
        2: {
          size: '800x1080',
          gravity: 'west',
        },
        3: {
          size: '1920x400',
          gravity: 'center',
        },
        4: {
          size: '1920x1080',
          gravity: 'center',
        },
        5: {
          size: '800x1080',
          gravity: 'west',
        },
        6: {
          size: '1920x400',
          gravity: 'center',
        },
      };

      gm()
        .out('-size', templateSettings[sentenceIndex].size)
        .out('-gravity', templateSettings[sentenceIndex].gravity)
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-kerning', '-1')
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [video-robot] Sentence created: ${outputFile}`);
          resolve();
        });
    });
  }
  async function createYouTubethumbnail() {
    return new Promise((resolve, reject) => {
      gm()
        .in('./content/0-converted.png')
        .write('./content/youtube-thumbnail.jpg', (erro) => {
          if (erro) {
            return reject(erro);
          }
          console.log('> [video-robot] YouTube thumbnail created');
          resolve();
        });
    });
  }
  async function renderVideoWithNode(content) {
    return new Promise((resolve, reject) => {
      const images = [];
      for (
        let sentenceIndex = 0;
        sentenceIndex < content.sentences.length;
        sentenceIndex++
      ) {
        images.push({
          path: `./content/${sentenceIndex}-converted.png`,
          caption: content.sentences[sentenceIndex].text,
        });
      }

      const videoOptions = {
        fps: 25,
        loop: 5, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '640x?',
        audioBitrate: '128k',
        audioChannels: 2,
        format: 'mp4',
        pixelFormat: 'yuv420p',
        useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
        subtitleStyle: {
          Fontname: 'Roboto',
          Fontsize: '38',
          PrimaryColour: '16777215',
          Bold: '2',
          Italic: '0',
          BorderStyle: '2',
          Outline: '2',
          Shadow: '3',
          Alignment: '1', // left, middle, right
          MarginL: '40',
          MarginR: '60',
          MarginV: '40',
        },
      };

      videoshow(images, videoOptions)
        .audio('content/audio-theme.mp3')
        .save(`content/${content.searchTerm}.mp4`)
        .on('progress', function (data) {
          const percent = data.percent.toFixed(2);
          console.log('> [video-robot] ffmpeg process: ', percent);
        })
        .on('error', function (err, stdout, stderr) {
          console.error('Error:', err);
          console.error('ffmpeg stderr:', stderr);
          return reject(err);
        })
        .on('end', function (output) {
          console.error('Video created in:', output);
          resolve();
        });
    });
  }
}

module.exports = robot;
