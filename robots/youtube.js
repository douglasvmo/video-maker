const express = require('express');
const google = require('googleapis').google;
const youtube = google.youtube({ version: 'v3' });
const fs = require('fs');
const OAuth2 = google.auth.OAuth2;

const state = require('./state');
const { log } = require('console');

async function robot() {
  const content = state.load();

  await authenticateWithOAuth2();
  const videoInformation = await uploadVideo(content);
  await uploadThumbnail(videoInformation);

  async function authenticateWithOAuth2() {
    const webServer = await startWebServer();
    const OAuthClient = await createOAuthClient();
    await requestUserConsetnt(OAuthClient);
    const authorizationToken = await waitForGoogleCalback(webServer);
    await requestGoogleForAccessTocken(OAuthClient, authorizationToken);
    await setGlobalGoogleAuthentication(OAuthClient);
    await stopWebServer(webServer);

    async function startWebServer() {
      return new Promise((resolve, reject) => {
        const port = 5000;
        const app = express();
        const server = app.listen(port, () => {
          console.log(`> listening on http://localhost:${port}`);
          resolve({
            app,
            server,
          });
        });
      });
    }

    async function createOAuthClient() {
      const credentials = require('../credentials/google-youtube.json');

      const OAuthClient = new OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      );
      return OAuthClient;
    }

    async function requestUserConsetnt(OAuthClient) {
      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube'],
      });
      console.log(`> Please give yor consent: ${consentUrl}`);
    }
    async function waitForGoogleCalback(webServer) {
      return new Promise((resolve, reject) => {
        console.log('>Waiting for user consent...');

        webServer.app.get('/oauth2callback', (req, res) => {
          const authcode = req.query.code;
          console.log(`> consent given: ${authcode}`);

          res.send('<h1>Thank you!</h1><p>Now close this tab.</p>');
          resolve(authcode);
        });
      });
    }
    async function requestGoogleForAccessTocken(
      OAuthClient,
      authorizationToken
    ) {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) {
            return reject(error);
          }
          console.log('> Access tokens recevid');
          OAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    }
    async function setGlobalGoogleAuthentication(OAuthClient) {
      google.options({
        auth: OAuthClient,
      });
    }

    async function stopWebServer(webServer) {
      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
          console.log('> Close OAuth2 web server local');
          resolve();
        });
      });
    }
  }
  async function uploadVideo(content) {
    const videoFilePath = './content/output.mp3';
    const videoFileSize = fs.statSync(videoFilePath).size;
    const videoTitle = `${content.prefix} ${content.searchTerm}`;
    const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
    const videoDescription = content.sentences
      .map((sentence) => {
        return sentence.text;
      })
      .join('n\n');

    const requestParameters = {
      part: 'snippet, status',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags,
        },
        status: { privacyStatus: 'unlisted' },
      },
      media: { body: fs.createReadStream(videoFilePath) },
    };
    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress,
    });
    console.log(
      `> Video avaliable at: https://youtu.be/${youtubeResponse.data.id}`
    );

    function onUploadProgress(e) {
      const progress = Math.round((e.bytesRead / videoFileSize) * 100);
      console.log(`> ${progress}% completed`);
    }
  }
}
module.exports = robot;
