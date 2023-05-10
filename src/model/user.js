const pool = require('../config/db');

const selectAllUsers = (searchParam, sortBy, sort, limit, offset) => {
    return pool.query(`SELECT id, fullname, username, email, image, 
        phone_number, created_at, updated_at, deleted_at FROM users 
        WHERE username ILIKE '%${searchParam}%' AND deleted_at IS null 
        ORDER BY ${sortBy} ${sort} LIMIT ${limit} OFFSET ${offset}`);
}

const selectUser = (id) => {
    return new Promise((resolve, reject) =>
        pool.query(`SELECT id, fullname, username, email, image, phone_number, 
            created_at, updated_at, deleted_at FROM users WHERE id='${id}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const insertUser = (data) => {
    const { id, fullname, username, email, password, created_at,
        updated_at } = data;
    return pool.query(`INSERT INTO users(id, fullname, username, email, 
        password, created_at, updated_at) VALUES('${id}', '${fullname}', 
        '${username}', '${email}', '${password}', '${created_at}',
        '${updated_at}')`);
}

const updateUser = (data) => {
    const { id, fullname, username, password, image,
        phone_number, updated_at } = data;
    return pool.query(`UPDATE users SET 
        ${fullname ? "fullname='" + fullname + "', " : ""}
        ${username ? "username='" + username + "', " : ""}
        ${password ? "password='" + password + "', " : ""}
        ${image ? "image='" + image + "', " : ""}
        ${phone_number ? "phone_number='" + phone_number + "', " : ""}
        updated_at='${updated_at}' WHERE id='${id}'`);
}

const deleteProfilePicture = (id) => {
    return pool.query(`UPDATE users SET image='' WHERE id='${id}'`);
}

const deleteUser = (id) => {
    return pool.query(`DELETE FROM users WHERE id='${id}'`);
}

const verifyEmail = (email) => {
    return pool.query(`UPDATE users SET email_verified=true WHERE email='${email}'`)
}

const findId = (id) => {
    return new Promise((resolve, reject) =>
        pool.query(`SELECT id FROM users WHERE id='${id}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const findEmail = (email) => {
    return new Promise((resolve, reject) =>
        pool.query(`SELECT * FROM users WHERE email='${email}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const findEmailVerified = (email) => {
    return new Promise((resolve, reject) =>
        pool.query(`SELECT email FROM users WHERE email='${email}' 
            AND email_verified=true`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const findUsername = (username) => {
    return new Promise((resolve, reject) =>
        pool.query(`SELECT username FROM users WHERE username='${username}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const updateUserPassword = (email, password) => {
    return new Promise((resolve, reject) =>
        pool.query(`UPDATE users SET password='${password}' WHERE email='${email}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

module.exports = {
    selectAllUsers,
    selectUser,
    insertUser,
    updateUser,
    deleteUser,
    verifyEmail,
    findId,
    findEmail,
    findEmailVerified,
    findUsername,
    updateUserPassword,
    deleteProfilePicture
}