# @immowelt/hypernova-express

[![Powered by Immowelt](https://img.shields.io/badge/powered%20by-immowelt-yellow.svg?colorB=ffb200)](https://stackshare.io/immowelt-group/)
[![Greenkeeper badge](https://badges.greenkeeper.io/ImmoweltGroup/hypernova-express.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/ImmoweltHH/hypernova-express.svg?branch=master)](https://travis-ci.org/ImmoweltHH/hypernova-express)
[![Dependency Status](https://david-dm.org/ImmoweltHH/hypernova-express.svg)](https://david-dm.org/ImmoweltHH/hypernova-express)
[![devDependency Status](https://david-dm.org/ImmoweltHH/hypernova-express/dev-status.svg)](https://david-dm.org/ImmoweltHH/hypernova-express#info=devDependencies&view=table)

> An express middleware which handles server side rendering via [Hypernova](https://github.com/airbnb/hypernova) from AirBnB.

## Usage
To install the middleware just execute the following command in your workspace.

```sh
npm i -S @immowelt/hypernova-express
```

and configure your express server to use the middleware, e.g.

```js
const express = require('express');
const path = require('path');
const Renderer = require('hypernova-client');
const createHypernovaMiddleware = require('@immowelt/hypernova-express');

const app = express();

app.get('/', createHypernovaMiddleware({
	createRequestProps: (req) => {
		const componentProps = {};

		return Promise.resolve({
			myRegisteredComponent: componentProps
		});
	},
	templatePath: path.join(__dirname, 'index.html'),
	templateMarker: '<i data-html></i>',
	renderer: new Renderer({
		url: `http://localhost:8081/batch`
	})
}));
```

## Configuration
As seen in the example you can configure the middleware just like any express middleware by passing in an options object.

#### `opts.createRequestProps`
A required function that returns a `Promise` which will resolve with the query/props for the hypernova renderer. The function gets called with the incomming request object from express is the best place to prepare or fetch props for your Component/App that shall be rendered.

#### `opts.templatePath`
A required full file-system path to the base template you want to wrap around the response of Hypernova.

#### `opts.templateMarker` (optional)
The piece of markup that will be replaced with the HTML retrieved from the Hypernova service.

#### `opts.renderer`
The required renderer instance of `hypernova-client`.

## Code style
Please make sure that you adhere to our code style, you can validate your changes / PR by executing `npm run lint`.
Visit the [hypernova-express](https://github.com/ImmoweltHH/hypernova-express) package for more information.

## Licensing
See the `LICENSE` file at the root of the repository.
