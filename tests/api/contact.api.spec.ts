import { test, expect } from '../../src/fixtures/apifixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';

let token: string;
let contactId: string;

let contact = {
    firstName: 'Neha', lastName: 'Sharma', birthdate: '1990-05-15', email: 'neha@example.com',
    phone: '9255550101', street1: '4100 Main Street', street2: 'Suite 200', city: 'Pleasanton',
    stateProvince: 'CA', postalCode: '94566', country: 'USA'
};

//CRUD: create -> read -> update -> delete
test.describe.serial('contact API: CRUD', () => {

    test('@smoke @regression POST API - sign up a user to get a token', async ({ apiHelper }) => {
        let response = await apiHelper.post('/users', { firstName: 'Api', lastName: 'Tester', email: uniqueEmail('api.user@example.com'), password: process.env.LOGIN_PASSWORD });
        expect(response.status()).toBe(201);
        token = (await response.json()).token;
    });
    
    test('@smoke @regression POST API - add a contact', async ({ apiHelper }) => {
        let response = await apiHelper.post('/contacts', contact, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(201);

        let body = await response.json();
        expect(body.firstName).toBe('Neha');
        expect(body.email).toBe('neha@example.com');
        contactId = body._id;
        console.log('contact id : ', contactId);
    });

    test('@regression GET API - get all contacts', async ({ apiHelper }) => {
        let response = await apiHelper.get('/contacts', { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.length).toBe(1);
    });

    test('@regression GET API - get the contact by id', async ({ apiHelper }) => {

        let response = await apiHelper.get(`/contacts/${contactId}`, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.lastName).toBe('Sharma');
    });

    test('@regression PUT API - update the contact', async ({ apiHelper }) => {
        //PUT sends the full contact again
        let updated = { ...contact, city: 'San Jose' };
        let response = await apiHelper.put(`/contacts/${contactId}`, updated, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.city).toBe('San Jose');
    });

    test('@regression PATCH API - update only the country', async ({ apiHelper }) => {
        let response = await apiHelper.patch(`/contacts/${contactId}`, { country: 'Canada' }, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);

        let body = await response.json();
        expect(body.country).toBe('Canada');
    });

    test('@regression DELETE API - delete the contact', async ({ apiHelper }) => {
        let response = await apiHelper.delete(`/contacts/${contactId}`, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(200);
    });

    test('@regression GET API - get the deleted contact -> 404', async ({ apiHelper }) => {
        let response = await apiHelper.get(`/contacts/${contactId}`, { Authorization: `Bearer ${token}` });
        expect(response.status()).toBe(404);
    });

});
