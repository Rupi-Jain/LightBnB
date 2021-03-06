const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Client } = require('pg');

const client = new Client({
  user: 'rupijain',
  host: 'localhost',
  database: 'lightbnb',
  port: 5432,
})
client.connect();

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  const queryString = `SELECT * from users where email = $1`;
  return client
       .query(queryString, [email])
       .then(result => result.rows)
       .catch(error => err.message)
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `SELECT * FROM users WHERE id = $1`
  return client
          .query(queryString, [id])
          .then(result => result.rows)
          .catch(error => err.message)
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const queryString = `INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3) RETURNING *`
  return client
          .query(queryString, [user.name, user.email, user.password])
          .then(result => result.rows)
          .catch(error => err.message)
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
// const getAllReservations = function(guest_id, limit = 10) {
//   return getAllProperties(null, 2);
// }
const getAllReservations = function(guest_id, limit = 10) {
  //return getAllProperties(null, 2);
  console.log("user_id", guest_id)
  const queryString = `SELECT * from properties
      JOIN reservations ON properties.id = reservations.property_id
      where guest_id = $1 LIMIT $2`
  return client
  .query(queryString, [guest_id,limit])
  .then(result => result.rows)
  .catch(err => err.message)
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if(options.owner_id) {
    queryParams.push(parseInt(options.owner_id));
    queryString += `WHERE owner_id = $${queryParams.length} `;
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryString+= queryParams.length === 0 ? `WHERE ` : `AND `;
    queryParams.push(options.minimum_price_per_night);
    queryString += `cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryString+= queryParams.length === 0 ? `WHERE ` : `AND `;
    queryParams.push(options.maximum_price_per_night);
    queryString += `cost_per_night <= $${queryParams.length} `;
  }

  queryString += `
  GROUP BY properties.id `
  if (options.minimum_rating) { 
    queryParams.push(options.minimum_rating);
    queryString += `having avg(property_reviews.rating) >= $${queryParams.length} `;
  }
  queryString += `
  ORDER BY cost_per_night `
  queryParams.push(limit);
  queryString += `
  LIMIT $${queryParams.length};
  `;
  
  return client
  .query(queryString, queryParams)
  .then(result => result.rows)
  .catch(err => err.message)
}

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const values = Object.values(property);
  values[2] = parseInt(values[2]);
  values[3] = parseInt(values[3]);
  values[4] = parseInt(values[4]);
  values[5] = parseInt(values[5]);
  console.log(values);
  const queryString = `INSERT INTO properties (
    title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code, owner_id) 
    VALUES ($1, $2,$3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`
    console.log(queryString);
    return client
    .query(queryString,)
    .then(result => result.rows)
    .catch(err => err.message)
 
}
exports.addProperty = addProperty;
