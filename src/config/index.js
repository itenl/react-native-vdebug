import packagejson from '../../package.json';

export default {
  APPINFO: {
    name: packagejson.name,
    author: packagejson.author,
    homepage: 'https://itenl.com',
    repository: packagejson.repository.url,
    description: packagejson.description,
    version: packagejson.version
  }
};
