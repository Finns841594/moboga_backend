/* eslint import/no-dynamic-require: 0 */
/* eslint no-console: 0 */
import request from 'supertest';
import { strictEqual, notStrictEqual, deepEqual } from 'assert';

import api from './index';

const { app } = api;

describe('The Cart API', () => {
  // Helpers
  const getThisAsJson = async url => request(app).get(url).set('Accept', 'application/json');
  const deleteThisAsJson = async url => request(app).delete(url);
  const postThis = async (url, postdata) => request(app).post(url).send(postdata).set('Accept', 'application/json');
  const assertLocationCartId = location => { strictEqual(/^\/api\/carts\/.*$/.test(location), true); };
  const isValidEmptyCart = cart => {
    strictEqual(Array.isArray(cart.products), true);
    strictEqual(cart.products.length, 0);
    strictEqual(cart.totalNumberOfItems, 0);
    strictEqual(cart.totalPrice, 0);
  };

  describe('GET /api/carts/', () => {
    it('returns dummy documentation', async () => {
      const response = await getThisAsJson('/api/carts/');
      strictEqual(response.body.message, 'You have reached the Cart API');
      strictEqual(response.status, 200);
    });
  });

  describe('POST /api/carts/', () => {
    describe('an empty body', () => {
      let response = null;
      before(async () => {
        response = await postThis('/api/carts', {});
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${response.body.cartId}/`);
      });

      it('status code is 201', () => { strictEqual(response.status, 201); });
      it('location header is correct', () => { assertLocationCartId(response.headers.location); });
      it('has a body', () => { notStrictEqual(response.body, undefined); });
      it('body is an valid empty cart', () => { isValidEmptyCart(response.body); });
    });
  });

  describe('GET /api/cart/:cartid', () => {
    describe('with an existing cart', () => {
      let getResponse = null;

      before(async () => {
        const postResponse = await postThis('/api/carts', {});
        const getURL = `/api/carts/${postResponse.body.cartId}/`;
        getResponse = await getThisAsJson(getURL);
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${getResponse.body.cartId}/`);
      });

      it('status code is 200', () => { strictEqual(getResponse.status, 200); });
      it('gets a body', () => { notStrictEqual(getResponse.body, undefined); });
      it('gets a valid empty cart', () => { isValidEmptyCart(getResponse.body); });
    });

    describe('missing cart for id', () => {
      let response = null;
      before(async () => {
        response = await getThisAsJson('/api/carts/000000000000/');
      });
      it('status code is 404', () => { strictEqual(response.status, 404); });
      it('body has message', () => { notStrictEqual(response.body.message, undefined); });
    });
  });

  describe('POST /api/carts/:cartId/products', () => {
    describe('with an existing empty cart', () => {
      let postProductResponse = null;
      let cart = null;

      before(async () => {
        const response = await postThis('/api/carts', {});
        const postUrl = `/api/carts/${response.body.cartId}/products/`;
        const productToPost = { productId: 'f3c183f5-ab80-4341-b14a-d2ef40748bba', quantity: 123 };

        postProductResponse = await postThis(postUrl, productToPost);
        cart = postProductResponse.body;
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${postProductResponse.body.cartId}/`);
      });

      it('status code is 201', () => { strictEqual(postProductResponse.status, 201); });
      it('body is something', () => { notStrictEqual(postProductResponse.body, undefined); });

      it('has the correct number of products', () => { strictEqual(cart.products.length, 1); });
      it('has the correct product added', () => { strictEqual(cart.products[0].productId, 'f3c183f5-ab80-4341-b14a-d2ef40748bba'); });
      it('has the added to correct number of the product', () => { strictEqual(cart.products[0].quantity, 123); });
      it('has the correct total quantity', () => { strictEqual(cart.totalNumberOfItems, 123); });
      it('has the correct total total price', () => { strictEqual(cart.totalPrice, 1451.4); });
    });

    describe('adding two products', () => {
      let postProductResponse = null;
      let cart = null;
      before(async () => {
        const response = await postThis('/api/carts', {});
        const postUrl = `/api/carts/${response.body.cartId}/products/`;

        const product1ToPost = { productId: 'f3c183f5-ab80-4341-b14a-d2ef40748bba', quantity: 1 };
        await postThis(postUrl, product1ToPost);

        const product2ToPost = { productId: 'b10c88ac-d34c-4f01-9830-7ae26263fe6b', quantity: 2 };
        postProductResponse = await postThis(postUrl, product2ToPost);
        cart = postProductResponse.body;
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${postProductResponse.body.cartId}/`);
      });

      it('has the correct number of products', () => { strictEqual(cart.products.length, 2); });
      it('has the correct total quantity', () => { strictEqual(cart.totalNumberOfItems, 3); });
      it('has the correct total total price', () => { strictEqual(cart.totalPrice, 31.78); });
    });

    describe('to an non-existing cart', () => {
      let addProductToCartResponse = null;
      before(async () => {
        const postData = { productId: 'f3c183f5-ab80-4341-b14a-d2ef40748bba', quantity: 123 };
        addProductToCartResponse = await postThis('/api/carts/000000000000/products/', postData);
      });
      it('status code is 404', () => { strictEqual(addProductToCartResponse.status, 404); });
      it('body has message', () => { notStrictEqual(addProductToCartResponse.body.message, undefined); });
    });

    describe('handles missing product id in post data', () => {
      let addProductToCartResponse = null;
      let postCartResponse = null;
      before(async () => {
        postCartResponse = await postThis('/api/carts', {});
        addProductToCartResponse = await postThis(`/api/carts/${postCartResponse.body.cartId}/products/`, { quantity: 123 });
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${postCartResponse.body.cartId}/`);
      });

      it('status is 400', () => { strictEqual(addProductToCartResponse.status, 400); });
      it('message has a value', () => { notStrictEqual(addProductToCartResponse.body.message, undefined); });
    });

    describe('handles missing quantity in post data', () => {
      let addProductToCartResponse = null;
      let postCartResponse = null;
      before(async () => {
        postCartResponse = await postThis('/api/carts', {});
        addProductToCartResponse = await postThis(`/api/carts/${postCartResponse.body.cartId}/products/`, { productId: 'f3c183f5-ab80-4341-b14a-d2ef40748bba' });
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${postCartResponse.body.cartId}/`);
      });

      it('status is 400', () => { strictEqual(addProductToCartResponse.status, 400); });
      it('message has a value', () => { notStrictEqual(addProductToCartResponse.body.message, undefined); });
    });

    describe('handles existing cart - not found product id', () => {
      let addProductToCartResponse = null;
      let postCartResponse = null;
      before(async () => {
        postCartResponse = await postThis('/api/carts', {});
        const postUrl = `/api/carts/${postCartResponse.body.cartId}/products/`;
        const productToPost = { productId: '123', quantity: 1 };

        addProductToCartResponse = await postThis(postUrl, productToPost);
      });

      after(async () => {
        await deleteThisAsJson(`/api/carts/${postCartResponse.body.cartId}/`);
      });

      it('status is 400', () => { strictEqual(addProductToCartResponse.status, 400); });
      it('message has a value', () => { notStrictEqual(addProductToCartResponse.body.message, undefined); });
    });
  });

  describe('DELETE /api/cart/:cartid', () => {
    describe('an existing cart', () => {
      let deleteResponse = null;

      before(async () => {
        const postResponse = await postThis('/api/carts', {});
        const getURL = `/api/carts/${postResponse.body.cartId}/`;
        deleteResponse = await deleteThisAsJson(getURL);
      });

      it('status code is 204', () => { strictEqual(deleteResponse.status, 204); });
      it('has no body', () => { deepEqual(deleteResponse.body, {}); });
    });

    describe('non-existant cart', () => {
      let deleteResponse = null;
      before(async () => {
        deleteResponse = await deleteThisAsJson('/api/carts/000000000000/');
      });
      it('status code is 204', () => { strictEqual(deleteResponse.status, 204); });
      it('has no body', () => { deepEqual(deleteResponse.body, {}); });
    });
  });
});
