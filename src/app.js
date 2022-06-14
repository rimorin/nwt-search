import jQuery from 'jquery';

window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333

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
import {BOOK_MAPPINGS, STOP_WORDS} from './utils/constants.js';


const TYPESENSE_SERVER_CONFIG = {
  apiKey: process.env.TYPESENSE_SEARCH_ONLY_API_KEY,
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: process.env.TYPESENSE_PORT || '8108',
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  numRetries: 5,
  useServerSideSearchCache: true,
};

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

let indexSize;

const getIndexSize = async () => {
  let results = await typesenseInstantsearchAdapter.typesenseClient.collections(INDEX_NAME)
    .documents()
    .search({ q: '*' });
  return results["found"];
}

(async () => {
  indexSize = await getIndexSize();
  console.log(indexSize);
})();

const search = instantsearch({
  searchClient,
  indexName: INDEX_NAME,
  routing: true,
  searchFunction(helper) {
    if (helper.state.query === '') {
      $('#results-section').addClass('d-none');
    } else {
      $('#results-section').removeClass('d-none');
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
        return `${statsText} found ${
          indexSize ? ` - Searched ${indexSize.toLocaleString()} verses` : ''
        } in ${processingTimeMS} ms.`;
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

$(function() {
  const $searchBox = $('#searchbox input[type=search]');

  // Clear refinements, when searching
  $searchBox.on('keydown', event => {
    search.helper.clearRefinements();
  });

  if (!matchMedia('(min-width: 768px)').matches) {
    $searchBox.on('focus, keydown', () => {
      $('html, body').animate(
        {
          scrollTop: $('#searchbox-container').offset().top,
        },
        500
      );
    });
  }
});
