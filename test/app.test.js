/**
 * Simple lib just use dist for testing.
 * Maybe add Typescript support when more time.
 * 
 * Currently just ensures component mounts without
 * errors. Not much of a test.
 * 
 * Feel free to write tests and submit PR!! :)
 * 
 */

import React from 'react';
import { create } from 'react-test-renderer';
import App from './app';
global.React = React; // hack to get around React not defined.

test('should test App using Provider.', () => {
  const component = create(<App />)
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});