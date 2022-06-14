import 'popper.js';
import 'bootstrap';

import instantsearch from 'instantsearch.js/es';
import {
  searchBox,
  infiniteHits,
  configure,
  stats,
  refinementList,
} from 'instantsearch.js/es/widgets';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import STOP_WORDS from './utils/stop_words.json';
import {BOOK_MAPPINGS} from './utils/constants.js';


let TYPESENSE_SERVER_CONFIG = {
  apiKey: process.env.TYPESENSE_SEARCH_ONLY_API_KEY, // Be sure to use an API key that only allows searches, in production
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: process.env.TYPESENSE_PORT || '8108',
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  numRetries: 8,
  useServerSideSearchCache: true,
};


// [2, 3].forEach(i => {
//   if (process.env[`TYPESENSE_HOST_${i}`]) {
//     TYPESENSE_SERVER_CONFIG.nodes.push({
//       host: process.env[`TYPESENSE_HOST_${i}`],
//       port: process.env.TYPESENSE_PORT,
//       protocol: process.env.TYPESENSE_PROTOCOL,
//     });
//   }
// });

// Unfortunately, dynamic process.env keys don't work with parcel.js
// So need to enumerate each key one by one

if (process.env[`TYPESENSE_HOST_2`]) {
  TYPESENSE_SERVER_CONFIG.nodes.push({
    host: anchorParams.host
      ? anchorParams.host
      : process.env[`TYPESENSE_HOST_2`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  });
}

if (process.env[`TYPESENSE_HOST_3`]) {
  TYPESENSE_SERVER_CONFIG.nodes.push({
    host: anchorParams.host
      ? anchorParams.host
      : process.env[`TYPESENSE_HOST_3`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  });
}

if (process.env[`TYPESENSE_HOST_NEAREST`]) {
  TYPESENSE_SERVER_CONFIG['nearestNode'] = {
    host: anchorParams.host
      ? anchorParams.host
      : process.env[`TYPESENSE_HOST_NEAREST`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  };
}

const INDEX_NAME = process.env.TYPESENSE_COLLECTION_NAME;

const bookMapping = (bookId) => {
  if(!bookId) return "Unknown";
  return BOOK_MAPPINGS[bookId];
}

const queryWithoutStopWords = (query) => {
  const words = query.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').split(' ');
  return words
    .map(word => {
      if (STOP_WORDS.includes(word.toLowerCase())) {
        return null;
      } else {
        return word;
      }
    })
    .filter(w => w)
    .join(' ')
    .trim();
}

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: TYPESENSE_SERVER_CONFIG,
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  additionalSearchParameters: {
    query_by: 'content'
  },
});
const searchClient = typesenseInstantsearchAdapter.searchClient;

const search = instantsearch({
  searchClient,
  indexName: INDEX_NAME,
  routing: true,
  searchFunction(helper) {
    const resultClassList = document.getElementById("results-section").classList;
    if (helper.state.query === '') {
      resultClassList.add('d-none');
    } else {
      resultClassList.remove('d-none');
      helper.search();
    }
  },
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
    showSubmit: false,
    showReset: false,
    placeholder: 'Type in a keyword, phrase or scripture',
    autofocus: true,
    cssClasses: {
      input: 'form-control',
    },
    queryHook(query, search) {
      const modifiedQuery = queryWithoutStopWords(query);
      if (modifiedQuery.trim() !== '') {
        search(modifiedQuery);
      }
    },
  }),
  stats({
    container: '#stats',
    templates: {
      text: ({ nbHits, hasNoResults, hasOneResult, processingTimeMS }) => {
        let statsText = '';
        if (hasNoResults) {
          statsText = 'No results';
        } else if (hasOneResult) {
          statsText = '1 result';
        } else {
          statsText = `${nbHits.toLocaleString()} results`;
        }
        return `${statsText} found in ${processingTimeMS} ms.`;
      },
    },
  }),
  infiniteHits({
    container: '#hits',
    cssClasses: {
      list: 'list-unstyled grid-container',
      item: 'd-flex flex-column search-result-card bg-light-2 p-3',
      loadMore: 'btn btn-primary mx-auto d-block mt-4',
    },
    templates: {
      item: `
            <h6 class="text-primary font-weight-light font-letter-spacing-loose mb-0">
              <a href={{ url }}>{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</a>
            </h6>
            <div class="mt-3 text-justify">
              {{#helpers.highlight}}{ "attribute": "content" }{{/helpers.highlight}}
            </div>
        `,
      empty: 'No scriptures found for <q>{{ query }}</q>. Try another search term.',
    },
  }),
  refinementList({
    container: '#book-refinement-list',
    attribute: 'book',
    searchable: true,
    searchablePlaceholder: 'Search Books',
    showMore: true,
    cssClasses: {
      searchableInput: 'form-control form-control-sm mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm align-content-center',
      list: 'list-unstyled',
      count: 'badge badge-light bg-light-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
    sortBy: ["count:desc,name:asc"],
    transformItems(items) {
      return items.map(item => ({
        ...item,
        highlighted: bookMapping(item.label),
      }));
    },
  }),
  configure({
    hitsPerPage: 15,
  })
]);

search.start();

function init () {
  const searchBox = document.querySelector('#searchbox input[type=search]');
  searchBox.onkeydown = function() {
    search.helper.clearRefinements();
  };

  if (!matchMedia('(min-width: 768px)').matches) {
    // searchBox.on('focus, keydown', () => {
    //   $('html, body').animate(
    //     {
    //       scrollTop: $('#searchbox-container').offset().top,
    //     },
    //     500
    //   );
    // });
    
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  init();
});