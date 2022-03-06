import { add } from '../main';

describe('main', () => {
  describe('add', () => {
    it('should add two numbers', () => {
      expect(add(2, 4)).toBe(6);
    });
  });
});
