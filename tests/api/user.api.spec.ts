import { test, expect } from '../../src/fixtures/apifixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';

let email = uniqueEmail('api.user@example.com');
let token: string;

//serial: each test uses what the previous test created
test.describe.serial('user API: sign up -> login -> profile -> update -> logout', () => {

    test('@smoke POST API - sign up a new user', async ({ apiHelper }) => {
        meta({ priority: 'P0', owner: 'Reshmi', feature: 'Users API' });

        let response = await apiHelper.post('/users', { firstName: 'Api', lastName: 'Tester', email: email, password: 'Test@1234' });
        expect(response.status()).toBe(201);

        let body = await response.json();
        expect(body.user.email).toBe(email);
        token = body.token;
    });

    test('@smoke POST API - login', async ({ apiHelper }) => {
        meta({ priority: 'P0', owner: 'Reshmi', feature: 'Users API' });

        let response = await apiHelper.post('/users/login', { email: email, password: 'Test@1234' });
        expect(response.status()).toBe(200);

        let body = await response.json();
        token = body.token;
        expect(token).toBeTruthy();
    });

    test('@regression GET API - get user profile', async ({ apiHelper }) => {
        meta({ priority: 'P1', owner: 'Reshmi', feature: 'Users API' });

        let response = await apiHelper.get('/users/me', { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.email).toBe(email);
    });

    test('@regression PATCH API - update the first name', async ({ apiHelper }) => {
        meta({ priority: 'P1', owner: 'Reshmi', feature: 'Users API' });

        let response = await apiHelper.patch('/users/me', { firstName: 'Updated' }, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.firstName).toBe('Updated');
    });

    test('@regression POST API - logout', async ({ apiHelper }) => {
        meta({ priority: 'P1', owner: 'Reshmi', feature: 'Users API' });

        let response = await apiHelper.post('/users/logout', {}, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        //the old token does not work any more
        let profile = await apiHelper.get('/users/me', { Authorization: `Bearer ${token}` });
        expect(profile.status()).toBe(401);
    });

});
