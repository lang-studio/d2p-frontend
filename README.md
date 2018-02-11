# dots2trip-frontend

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
// then under dist/, run: 
python3 -m http.server 8080

# build for production and view the bundle analyzer report
npm run build --report

# test
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

### How to run
- start `python3 -m http.server` at dev-resources/ directory. This starts a local cdn for images.
- start `json-server --watch dev-resources/db.json`. This starts a mock json server.

### How to run unit tests

`npm test`

### javascript style guide
- class name: camelCase
- methods/variable name: underscore

### Naming conventions
main functionalities:
- map related
- autocomplete search: search-*

### TODO
- remove dependency on jquery-ui (too big)
- ~~separate into different css/js files~~
- ~~autocomplete search input~~
- ~~drag and drop to list view~~
- enable links on google map other locations
- custom destinations


### References
- [drag marker off google map](http://jsfiddle.net/H4Rp2/38/)
- vue related
    - [vue draggable](https://github.com/SortableJS/Vue.Draggable)
    - [single file components](https://vuejs.org/v2/guide/single-file-components.html)
- [autocomplete related](https://github.com/devbridge/jQuery-Autocomplete)
    - [Retaining autocomplete results after no matches occurs](https://github.com/devbridge/jQuery-Autocomplete/issues/553)
    - [design for forcing users to choose from suggestions only](https://ux.stackexchange.com/questions/20413/how-to-force-a-user-to-choose-from-suggestions-by-typing)
    - [Can user only select value from the suggestions list](https://github.com/devbridge/jQuery-Autocomplete/issues/446)
- design
    - [material design](https://material.io/)
