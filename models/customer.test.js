"use strict";

// app imports
const app = require("../app");
const db = require("../db");
const Customer = require("./customer");
const Reservation = require("./reservation");
const moment = require("moment");

let testCustomer;
let testData;
let testReservationData;
let goodData;

beforeEach(async function () {
    await db.query("DELETE FROM reservations");
    await db.query("DELETE FROM customers");

    goodData = {
        firstName: "first", lastName: "last", phone: "1234567890", notes: "none"
    };

    const customerResults = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, notes`,
        ["testf", "testl", "1234567890", "n/a"]
    );
    testData = customerResults.rows[0];
    testCustomer = new Customer(testData);

    const reservationResults = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id, customer_id as "customerId", start_at as "startAt", num_guests as "_numGuests", notes`,
        [testCustomer.id, "2018-09-08 12:20:07-07", 2, '123'],
      );

    console.log("testingCustomter", customerResults.rows[0]);

    testReservationData = reservationResults.rows[0];

});

describe("Test static Customer methods", function () {
    test("test all()", async function () {
        expect(await Customer.all()).toEqual([testData]);
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

    test("test bestCustomers()", async function(){
        expect(await Customer.bestCustomers()).toEqual([testData]);
        const allResults = await Customer.bestCustomers();
        expect(allResults).toBeInstanceOf(Array);
        expect(allResults[0]).toBeInstanceOf(Customer);
    });

});

describe("Test regular methods on Customer instance", function () {
    test("test getReservations()", async function(){
        expect(await testCustomer.getReservations(testCustomer.id))
        .toEqual([testReservationData]);
        const allResults = await testCustomer.getReservations();
        expect(allResults).toBeInstanceOf(Array);
        expect(allResults[0]).toBeInstanceOf(Reservation);
    });

    test("test save()", async function(){
        //pass in the data to make an instance of Customer
        let customer = new Customer(goodData);
        //create a new record and save into db
        await customer.save();
        //retrive from db based on the id
        const result = await db.query(
            `SELECT id, first_name as "firstName", last_name as "lastName", phone, notes
            FROM customers
            WHERE id = $1`,
            [customer.id]
        );
        const dbCustomer = new Customer(result.rows[0]);
        expect(customer).toEqual(dbCustomer);
    });

    test("test fullName()", async function(){
        expect(testCustomer.fullName).toEqual(`${testCustomer.firstName} ${testCustomer.lastName}`);
    });
});