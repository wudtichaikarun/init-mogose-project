import recursiveReaddirSync from 'recursive-readdir-sync';
import * as R from 'ramda';

const loadFromArray = (path, extensionList, files) => {
  const matcher = () => {
    // let matchedExtension = false
    // for (let extension of extensionList) {
    //   if (path.indexOf(`.${extension}.js`) !== -1) {
    //     matchedExtension = extension
    //     break
    //   }
    // }
    const matchedExtension = R.compose(
      keys => {
        return keys.find(extension => {
          if (path.indexOf(`.${extension}.js`) !== -1) {
            return extension;
          }
          return false;
        });
      },
      R.keys
    )(extensionList);

    return matchedExtension;
  };

  // let initObject = {}
  // for (let key in extensionList) {
  //   initObject[extensionList[key]] = {}
  // }
  const initObject = R.compose(
    keys => {
      R.map(
        key => ({
          [`${extensionList[key]}`]: {}
        }),
        keys
      );
    },
    R.keys
  )(extensionList);

  const _files = files.reduce((current, acc) => {
    const matchedExtension = matcher(acc, extensionList);
    if (matchedExtension) {
      const config = require(acc);
      const configName = R.compose(
        R.head,
        R.split('.'),
        R.replace('/', ''),
        R.replace(path, '')
      )(acc);
      return {
        ...current,
        [`${matchedExtension[configName]}`]: config
      };
    }
    return current;
  }, initObject);
  return _files;
};

const loadFromString = (path, extension, files) => {
  const result = R.reduce(
    // function
    (acc, file) => {
      /** ex.
       * path = 'root/src/mapping'
       * file = 'root/src/mapping/staff.mapping.js'
       */
      if (
        R.indexOf(`.${extension}.js`, file) !== -1 &&
        // !file.match(/map$/)
        R.compose(
          R.last,
          R.split('.')
        )(file) !== 'map'
      ) {
        const config = require(file);
        // configName::(file) -> 'staff'
        const configName = R.compose(
          // R.head(['staff', 'mapping', 'js']) -> 'staff'
          R.head,
          // R.split('.', 'staff.mapping.js') -> ['staff', 'mapping', 'js']
          R.split('.'),
          // R.replace('/', '', '/staff.mapping.js') -> 'staff.mapping.js'
          R.replace('/', ''),
          // R.replace(path, '', file) -> '/staff.mapping.ja'
          R.replace(path, '')
        )(file);
        return {
          ...acc,
          [`${configName}`]: config
        };
      }
      return acc;
    },
    // initial acc value
    {},
    // source Array
    files
  );
  return result;
};

export default (path, extension) => {
  const files = recursiveReaddirSync(path);
  const isMultipleExtension =
    R.type(extension) === 'object';
  const loader = isMultipleExtension
    ? loadFromArray
    : loadFromString;
  return loader(path, extension, files);
};
