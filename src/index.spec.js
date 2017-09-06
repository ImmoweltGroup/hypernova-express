const request = require('supertest');
const mockFs = require('mock-fs');
const sinon = require('sinon');
const express = require('express');
const createHypernovaMiddleware = require('./index.js');

describe('createHypernovaMiddleware()', () => {
  beforeEach(() => {
    mockFs(
      {
        '/foo/bar/index.html': '<html><i data-html></i></html>'
      },
      {
        createCwd: false,
        createTmp: false
      }
    );
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should be a function.', () => {
    expect(typeof createHypernovaMiddleware).toBe('function');
  });

  it('should throw an error if no "renderer" option was passed.', () => {
    expect(() => createHypernovaMiddleware({})).toThrow();
  });

  it('should throw an error if no "templatePath" option was passed.', () => {
    const renderer = {render: () => Promise.resolve()};

    expect(() => createHypernovaMiddleware({renderer})).toThrow();
  });

  it('should throw an error if no "createRequestProps" option was passed.', () => {
    const renderer = {render: () => Promise.resolve()};
    const templatePath = '/foo/bar.html';

    expect(() => createHypernovaMiddleware({renderer, templatePath})).toThrow();
  });

  it('should return a middleware function when called.', () => {
    const middleware = createHypernovaMiddleware({
      renderer: {
        render: () => Promise.resolve()
      },
      createRequestProps: () => Promise.resolve({}),
      templatePath: '/foo/bar/index.html'
    });

    expect(typeof middleware).toBe('function');
  });

  it('should call the renderer.render method and provide it with the requestProps from the createRequestProps option.', done => {
    const html = '<div>foo</div>';
    const requestProps = {};
    const options = {
      renderer: {
        render: sinon.spy(() => Promise.resolve(html))
      },
      createRequestProps: sinon.spy(() => Promise.resolve(requestProps)),
      templatePath: '/foo/bar/index.html'
    };
    const app = express();

    app.get('/', createHypernovaMiddleware(options));

    request(app)
      .get('/')
      .expect(200, `<html>${html}</html>`, err => {
        expect(options.createRequestProps.callCount).toBe(1);
        expect(options.renderer.render.callCount).toBe(1);
        expect(options.renderer.render.args[0][0]).toBe(requestProps);

        done(err);
      });
  });
});
