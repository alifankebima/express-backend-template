const pool = require('../config/db');

const selectAllUsers = (searchParam, sortBy, sort, limit, offset) => {
    return pool.query(`
        SELECT id, fullname, email, role, image, phone_number, address,
            created_at, updated_at
        WHERE username ILIKE '%${searchParam}%' 
        ORDER BY ${sortBy} ${sort} LIMIT ${limit} OFFSET ${offset}`
    )
}

const selectUser = (id) => {
    return new Promise((resolve, reject) =>
        pool.query(`
            SELECT id, fullname, email, role, image, phone_number, address,
                created_at, updated_at 
            FROM users 
            WHERE id='${id}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)
        )
    )
}

const insertUser = (data) => {
    const { id, fullname, email, password, role, created_at, updated_at } = data;
    return pool.query(`
        INSERT INTO users(id, fullname, email, password, role, 
            created_at, updated_at) 
        VALUES('${id}', '${fullname}', '${email}', '${password}', '${role}', 
            '${created_at}', '${updated_at}')`
    )
}

const updateUser = (data) => {
    const { id, fullname, password, role, image, phone_number, address, 
        updated_at } = data;

    let updateUserQuery = "UPDATE users SET "
    if(fullname) query += `fullname='${fullname}' `
    if(password) query += `password='${password}' `
    if(role) query += `role='${role}' `
    if(image) query += `image='${image}' `
    if(phone_number) query += `phone_number='${phone_number}' `
    if(address) query += `address='${address}' `
    updateUserQuery += `WHERE id='${id}'`

    return pool.query(updateUserQuery);
}

const deleteUser = (id) => {
    return pool.query(`DELETE FROM users WHERE id='${id}'`);
}

const findEmail = (email) => {
    return new Promise((resolve, reject) =>
        pool.query(`
            SELECT * 
            FROM users 
            WHERE email='${email}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)
        )
    )
}

const verifyEmail = (email) => {
    return pool.query(`
        UPDATE users 
        SET email_verified=true 
        WHERE email='${email}'`
    )
}

const updateUserPassword = (email, password) => {
    return new Promise((resolve, reject) =>
        pool.query(`
            UPDATE users 
            SET password='${password}' 
            WHERE email='${email}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

module.exports = {
    selectAllUsers,
    selectUser,
    insertUser,
    updateUser,
    deleteUser,
    findEmail,
    verifyEmail,
    updateUserPassword,
}