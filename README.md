# NWT Search, powered by Typesense

View it live here: [nwt-search.live](https://nwt-search.live)

## Tech Stack

This search experience is powered by <a href="https://typesense.org" target="_blank">Typesense</a> which is
a blazing-fast, <a href="https://github.com/typesense/typesense" target="_blank">open source</a> typo-tolerant
search-engine. It is an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

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
