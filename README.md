# NWT Search

View it live here: [nwt-search.live](https://nwt-search.live)

<img width="791" alt="Screenshot 2022-06-14 at 10 58 04 PM" src="https://user-images.githubusercontent.com/40650158/173609791-20191c29-8e80-4582-9821-847e21d94cab.png">

<img width="1015" alt="Screenshot 2022-06-14 at 10 59 12 PM" src="https://user-images.githubusercontent.com/40650158/173609967-c44949be-65b0-4e91-acfe-9394ad893466.png">


## Tech Stack

This search experience is powered by <a href="https://typesense.org" target="_blank">Typesense</a> which is
a blazing-fast, <a href="https://github.com/typesense/typesense" target="_blank">open source</a> typo-tolerant
search-engine. It is an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

## Repo structure

- `src/` and `index.html` - contain the frontend UI components, built with <a href="https://github.com/typesense/typesense-instantsearch-adapter" target="_blank">Typesense Adapter for InstantSearch.js</a>

## Development

To run this project locally, install the dependencies and run the local server:

1. Install parcel builder

```sh
npm install -g parcel-bundler # Need to use NPM for this: https://github.com/parcel-bundler/parcel/issues/1036#issuecomment-559982275
```

2. Create local env variable shell file

```sh
export TYPESENSE_HOST=localhost
export TYPESENSE_PORT=8108
export TYPESENSE_PROTOCOL=http
export TYPESENSE_COLLECTION_NAME=contents
export TYPESENSE_SEARCH_ONLY_API_KEY=xxxx
```

3. Run npm start
```sh
npm start
```

Open http://localhost:3000 to see the app.

## Deployment

1. Run parcel build
```sh
npm run build
```

2. Upload files to static storage such as S3 or Gcloud storage and configure CDN
