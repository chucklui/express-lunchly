"use strict";

// app imports
const app = require("../app");
const db = require("../db");
const Customer = require("./customer");

let goodData;
let badData;
let testCustomer;

beforeEach(async function () {
    await db.query("DELETE FROM customers");

    const results = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, notes`,
        ["testf", "testl", "1234567890", "n/a"]
    );

    console.log("testingCustomter", results.rows[0])

    const testData = results.rows[0];
    testCustomer = new Customer(testData);

    goodData = {
        firstName: "first", lastName: "last", phone: "1234567890", notes: "none"
    };
});

describe("Test static Customer methods", function () {
    test("test all()", async function () {
        expect(await Customer.all()).toEqual([testCustomer]);
        const allResults = await Customer.all();
        expect(allResults).toBeInstanceOf(Array);
        expect(allResults[0]).toBeInstanceOf(Customer);

    });

    test("test get()", async function() {
        expect(await Customer.get(testCustomer.id)).toEqual(testCustomer);
        expect(await Customer.get(testCustomer.id)).toBeInstanceOf(Customer);
    });

    test("test search()", async function() {
        const {firstName, lastName} = testCustomer;

        expect(await Customer.search(firstName, lastName)).toEqual([testCustomer]);
        const searchResults = await Customer.search(firstName, lastName);
        expect(searchResults).toBeInstanceOf(Array);
        expect(searchResults[0]).toBeInstanceOf(Customer);

    });
});