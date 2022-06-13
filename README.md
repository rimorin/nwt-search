# 🎶 NWT Search, powered by Typesense

View it live here: [nwt.search](https://nwt.search)

## Tech Stack

This search experience is powered by <a href="https://typesense.org" target="_blank">Typesense</a> which is
a blazing-fast, <a href="https://github.com/typesense/typesense" target="_blank">open source</a> typo-tolerant
search-engine. It is an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

The songs dataset is from <a href="https://musicbrainz.org/" target="_blank">MusicBrainz</a> which is an open
music encyclopedia that collects music metadata and makes it available to the public. Please contribute to it if you're able to!

The app was built using the <a href="https://github.com/typesense/typesense-instantsearch-adapter" target="_blank">
Typesense Adapter for InstantSearch.js</a> and is hosted on <a href="https://www.digitalocean.com/products/app-platform/" target="_blank">DigitalOcean's App Platform</a>.

The search backend is powered by a geo-distributed 3-node Typesense cluster running on <a href="https://cloud.typesense.org" target="_blank">Typesense Cloud</a>,
with nodes in Oregon, Frankfurt and Mumbai.

## Repo structure

- `src/` and `index.html` - contain the frontend UI components, built with <a href="https://github.com/typesense/typesense-instantsearch-adapter" target="_blank">Typesense Adapter for InstantSearch.js</a>

## Development

To run this project locally, install the dependencies and run the local server:

```sh
npm install -g parcel-bundler # Need to use NPM for this: https://github.com/parcel-bundler/parcel/issues/1036#issuecomment-559982275

yarn
yarn run typesenseServer
ln -s .env.development .env
BATCH_SIZE=1000 yarn run indexer
yarn start
```

Open http://localhost:3000 to see the app.

## Deployment

Pushing to master will deploy the app to production.
