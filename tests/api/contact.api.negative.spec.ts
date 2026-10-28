import { test, expect } from '../../src/fixtures/apifixtures';
import { JsonHelper } from '../../src/utils/JsonHelper';
import { uniqueEmail } from '../../src/utils/emailUtil';

let email = uniqueEmail('api.user@example.com');
let password = process.env.LOGIN_PASSWORD;
let token: string;

test.describe.serial('negative API tests', () => {

    test('@regression POST API - sign up a user to get a token', async ({ apiHelper }) => {
        const response = await apiHelper.post('/users', {
            firstName: 'Api', lastName: 'Tester', email, password,
        });
        expect(response.status()).toBe(201);
        token = (await response.json()).token;
    });

    test('@regression GET API - contacts without a token -> 401', async ({ apiHelper }) => {
        let response = await apiHelper.get('/contacts');
        expect(response.status()).toBe(401);
    });

    test('@regression GET API - contacts with an invalid token -> 401', async ({ apiHelper }) => {
        let response = await apiHelper.get('/contacts', { Authorization: 'Bearer invalid.token.value' });
        expect(response.status()).toBe(401);
    });

    test('@regression POST API - login with a wrong password -> 401', async ({ apiHelper }) => {
        let response = await apiHelper.post('/users/login', { email: email, password: 'Wrong@9999' });
        expect(response.status()).toBe(401);
    });

    test('@regression POST API - sign up with an existing email -> 400', async ({ apiHelper }) => {
        let response = await apiHelper.post('/users', { firstName: 'Api', lastName: 'Tester', email: email, password: password });
        expect(response.status()).toBe(400);
    });

    test('@regression POST API - sign up with a short password -> 400', async ({ apiHelper }) => {
        let response = await apiHelper.post('/users', { firstName: 'Api', lastName: 'Tester', email: uniqueEmail('short@example.com'), password: 'abc12' });
        expect(response.status()).toBe(400);
    });

    test('@regression GET API - a contact that does not exist -> 404', async ({ apiHelper }) => {
        let response = await apiHelper.get('/contacts/000000000000000000000000', { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(404);
    });

    //data driven: every invalid contact in the JSON file must be rejected
    let testJSONData = JsonHelper.readJson('src/testdata/invalidcontacts.json');
    for (let row of testJSONData) {
        test(`@regression POST API - add a contact with invalid JSON data -> 400 - ${row.testName}`, async ({ apiHelper }) => {
            let response = await apiHelper.post('/contacts', row, { Authorization: `Bearer ${token}` });
            expect(response.status()).toBe(400);
        });
    }

});
