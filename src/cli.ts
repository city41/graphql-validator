import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import { GraphQLSchema, buildSchema } from 'graphql';
import * as validator from './index'

function buildDirectives(directives: string) {
    return directives.split(',').reduce((acc, d) => {
        return `${acc}
directive @${d} on FIELD`;

    }, '');
}

export function loadSchema(schemaPattern: string, additionalDirectives?: string): Promise<GraphQLSchema> {
    const schemaTypeDefs = fileLoader(schemaPattern);

    if (additionalDirectives) {
        schemaTypeDefs.push(buildDirectives(additionalDirectives));
    }

    const fullSchema = mergeTypes(schemaTypeDefs);

    console.log('fullSchema', fullSchema);

    return Promise.resolve(buildSchema(fullSchema));
}

export function validateQueries(queriesPattern: string, validSchema: GraphQLSchema): Promise<void> {
    console.log(`\nValidating queries for ${queriesPattern} using loaded schema`)

    function outputErrors(errs) {
        console.log('\nErrors found:')
        errs.forEach((err) => {
            console.log(`\nFile: ${err.file}`)
            err.errors.forEach((errStr) => {
                console.log(`\t${errStr}`)
            })
        })
        console.log('\n')
    }

    return validator.validateQueryFiles(queriesPattern, validSchema).then(() => {
        console.log('All queries are valid\n')
    }).catch((errs) => {
        outputErrors(errs)
    })
}
