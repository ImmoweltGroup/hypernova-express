const request = require('supertest');
const mockFs = require('mock-fs');
const sinon = require('sinon');
const express = require('express');
const createHypernovaMiddleware = require('./ssr.js');

describe('createHypernovaMiddleware()', () => {
	beforeEach(() => {
		mockFs({
			'/foo/bar/index.html': '<html><i data-html></i></html>'
		}, {
			createCwd: false,
			createTmp: false
		});
	});

	afterEach(() => {
		mockFs.restore();
	});

	it('should be a function.', () => {
		expect(typeof createHypernovaMiddleware).toBe('function');
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

	it('should return a middleware function when called.', done => {
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
