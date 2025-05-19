import { PrettyKeyPipe } from './pretty-key.pipe';

describe('PrettyKeyPipe', () => {
  it('create an instance', () => {
    const pipe = new PrettyKeyPipe();
    expect(pipe).toBeTruthy();
  });
});
