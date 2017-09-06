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

const pify = require('pify');
const fs = require('fs');

const readFile = pify(fs.readFile);
const err = (msg: string) => {
  throw new Error(`createHypernovaMiddleware(): ${msg}`);
};

/**
 * Creates the express middleware to which handles server side rendering via Hypernova.
 *
 * @param  {Object}   opts The options object which configures the middleware.
 * @return {Function}      The configured express middleware.
 */
function createHypernovaMiddleware(opts: OptsType) {
  const {
    renderer,
    createRequestProps,
    templatePath,
    templateMarker = '<i data-html></i>'
  } =
    opts || {};

  if (
    !renderer ||
    typeof renderer !== 'object' ||
    typeof renderer.render !== 'function'
  ) {
    err(`Option "renderer" must be an instance of the hypernova-client Class.`);
  }

  if (typeof templatePath !== 'string') {
    err(
      `Option "templatePath" must be a string pointing to the HTML template to use when creating the finalized HTML.`
    );
  }

  if (typeof createRequestProps !== 'function') {
    err(
      `Option "createRequestProps" must be a function that resolves with the renderer props/query.`
    );
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
      .catch(console.error);
  };
}

module.exports = createHypernovaMiddleware;
