import util from 'util';
import _ from 'lodash';

import xml2js from 'xml2js';
import yaml from 'js-yaml';

export default async (xmlData) => {
    const parser = new xml2js.Parser({ explicitCharkey: true });
    const parseString = util.promisify(parser.parseString);

    const parsed = await parseString(xmlData);
    const transformed = transform(parsed);
    const formatted = yaml.dump(transformed);
    return formatted;
};



const transform = (node) => {
    return Object.keys(node).reduce((acc, key) => {

        switch(key) {
        case '$':
            return { desc: `** ${node[key].name || 'test'}` };

        case 'expression':
            return {...acc, [key]: node[key][0]['_']};

       case 'output':
            return {...acc, result: node[key].map(item => item['_'] ? item['_'] : '')};

        case 'tests':
            return { ...acc, tests: transform(node[key])};

        case 'group':
            return [ ...acc, ...transform(node[key]) ];

        default:
            if(!isNaN(Number(key))) {
                return [...acc, ...transform(node[key])];
            }
            return [acc, ...node[key].map(item => transform(item))];
        }
    }, []);
};

