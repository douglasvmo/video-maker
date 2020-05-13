const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const imageDownloader = require('image-downloader');
const state = require('./state');

const googleSerachCredentials = require('../credentials/google-search.json');

async function robot() {
  const content = state.load();

  await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);

  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;

      sentence.images = await fetchGoogleAndReturnImagesLinks(query);
      sentence.googleSearchQuery = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSerachCredentials.apiKey,
      cx: googleSerachCredentials.searchEngineId,
      q: query,
      searchType: 'image',
      imgSize: 'huge',
      num: 2,
    });

    const imagesUrl = response.data.items.map((item) => {
      return item.link;
    });

    return imagesUrl;
  }

  async function downloadAllImages(content) {
    content.downloadedImages = [];

    console.log(content.downloadedImages);
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;
      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];
        try {
          if (content.downloadedImages.includes(imageUrl)) {
            console.log('include');
            throw new Error('imagem ja foi baixada');
          }
          await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(
            `[${sentenceIndex}, [${imageIndex}] Baixou imagem com sucesso: ${imageUrl} `
          );
          break;
        } catch (err) {
          console.log(`[${sentenceIndex}, [${imageIndex}] ${err} ${imageUrl}`);
        }
      }
    }
  }
  async function downloadAndSaveImage(url, fileName) {
    return imageDownloader.image({
      url,
      dest: `./content/${fileName}`,
    });
  }
}

module.exports = robot;
