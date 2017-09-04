// @flow

import type {$Response, $Request} from 'express';

type OptsType = {
	renderer: {
		render: (query: Object) => Promise<string>
	},
	createRequestProps: (req: $Request) => Promise<Object>,
	templatePath: string,
	templateMarker?: string
};

const logger = require('log-fancy')('@immowelt/hypernova-express');
const pify = require('pify');
const fs = require('fs');
const readFile = pify(fs.readFile);

function createHypernovaMiddleware(opts: OptsType) {
	const {
		renderer,
		createRequestProps,
		templatePath,
		templateMarker = '<i data-html></i>'
	} = (opts || {});

	if (!renderer || typeof renderer !== 'object' || typeof renderer.render !== 'function') {
		logger.fatal(`createSsrMiddleware(): Option "renderer" must be an instance of the hypernova-client Class.`);
	}

	if (typeof templatePath !== 'string') {
		logger.fatal(`createSsrMiddleware(): Option "templatePath" must be a string pointing to the HTML template to use when creating the finalized HTML.`);
	}

	if (typeof createRequestProps !== 'function') {
		logger.fatal(`createSsrMiddleware(): Option "createRequestProps" must be a function that resolves with the renderer props/query.`);
	}

	return (req: $Request, res: $Response) => {
		createRequestProps(req)
			.then(props => {
				return Promise.all([
					readFile(templatePath, 'utf8'),
					renderer.render(props)
				]);
			})
			.then(([templateHtml, uiAppHtml]: Array<string>) => {
				const html = templateHtml.replace(templateMarker, uiAppHtml);

				res.send(html);
				res.end();

				return null;
			})
			.catch(logger.error);
	};
}

module.exports = createHypernovaMiddleware;
