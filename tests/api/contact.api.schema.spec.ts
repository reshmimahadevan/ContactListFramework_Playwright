//schema : type of response data
//ajv -- node lib for the schema validation
import { test, expect } from '../../src/fixtures/apifixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';
import Ajv from 'ajv';
import fs from 'fs';

//setup the AJV:
const ajv = new Ajv();

//fs.readFileSync() just returns a string, so JSON.parse turns the schema file into an object
const loginSchema = JSON.parse(fs.readFileSync('./src/schema/loginresponse.schema.json', 'utf-8'));
const userSchema = JSON.parse(fs.readFileSync('./src/schema/user.schema.json', 'utf-8'));
const contactSchema = JSON.parse(fs.readFileSync('./src/schema/contact.schema.json', 'utf-8'));

let token: string;

test.describe.serial('schema tests', () => {

    test('@smoke sign up response - schema test', async ({ apiHelper }) => {
        let response = await apiHelper.post('/users', { firstName: 'Api', lastName: 'Tester', email: uniqueEmail('schema@example.com'), password: process.env.LOGIN_PASSWORD });
        expect(response.status()).toBe(201);

        let body = await response.json();
        token = body.token;

        const validate = ajv.compile(loginSchema);
        const isSchemaValid = validate(body);
        console.log('SCHEMA ERRORS: ', validate.errors);
        expect(isSchemaValid).toBeTruthy();
    });

    test('@smoke get user profile - schema test', async ({ apiHelper }) => {

        let response = await apiHelper.get('/users/me', { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        const validate = ajv.compile(userSchema);
        const isSchemaValid = validate(await response.json());
        console.log('SCHEMA ERRORS: ', validate.errors);
        expect(isSchemaValid).toBeTruthy();
    });

    test('@smoke add a contact - schema test', async ({ apiHelper }) => {
        meta({ priority: 'P1', owner: 'Reshmi', feature: 'Schema' });

        let response = await apiHelper.post('/contacts', { firstName: 'Neha', lastName: 'Sharma', email: 'neha@example.com', phone: '9255550101' }, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(201);

        const validate = ajv.compile(contactSchema);
        const isSchemaValid = validate(await response.json());
        console.log('SCHEMA ERRORS: ', validate.errors);
        expect(isSchemaValid).toBeTruthy();
    });

    //Array
    test('@smoke get all contacts - schema test', async ({ apiHelper }) => {

        let response = await apiHelper.get('/contacts', { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        const validate = ajv.compile({ type: 'array', items: contactSchema });
        const isSchemaValid = validate(await response.json());
        console.log('SCHEMA ERRORS: ', validate.errors);
        expect(isSchemaValid).toBeTruthy();
    });

});
