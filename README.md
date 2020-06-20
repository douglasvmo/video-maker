# Video Maker

This project is a tool for automatic video creation and uploading on YouTube

## :coffee: &nbsp; Prerequisites

- Node (https://nodejs.org)
- ImageMagick (https://imagemagick.org/)
- FFmpeg (https://ffmpeg.org/)

## :vulcan_salute: &nbsp; Presentations

This project create a video from a search term. The search term is fetched in wikipedia and analyzed with Watson IBM to fetched google images and render the video with wikipedia sentences. The project is inspired by the master [Filipe Deschamps](https://github.com/filipedeschamps) and full-dopamina sensation.

## :star2: &nbsp; Getting Started

1. Cloning the repository

```bash
git clone https://github.com/douglasOlv/video-maker.git
cd video-maker
npm install
```

2. The keys of access. You need to have keys of access to APIs, of course.

- Sign in [Algorithmia](https://algorithmia.com/) and create a key acesses to WikipediaParser
- Sign in [IBM](https://cloud.ibm.com/login) and create a key acesses to _Natural Language Understanding_
- Sign in [Google Cloud Plataform](https://cloud.google.com/) and create a "new project" and search in "API" for "Custom Search API" and select ativate, in Credentials create a new credential API Key
- Create a [Custom Search Enginer](https://cse.google.com/cse/create/new) and active the image search

3. Start up, you need have NodeJs, of course.

```bash
node index.js
```

## :rocket: &nbsp; Built With

This project was developed with the following technologies:

- [Node.js](https://nodejs.org/)
- [Algorithmia WikipediaParser](https://algorithmia.com/algorithms/web/WikipediaParser)
- [Watson Natural Lenguage Understanding ](https://www.ibm.com/cloud/watson-natural-language-understanding?lnk=STW_US_STESCH&lnk2=trial_WatNatLangUnd&pexp=def&psrc=none&mhsrc=ibmsearch_a&mhq=nlu)
- [Custom Search Google API](https://developers.google.com/custom-search)
- [Videoshow](https://www.npmjs.com/package/videoshow)

## :information_source: &nbsp; Other Information

This project is licensed under the MIT License - see the [LICENSE.md](/LICENSE) file for details.

Made by Douglas Oliveira [Get in touch](https://www.linkedin.com/in/douglasolv) :wave:

> Because creating thing is fun
