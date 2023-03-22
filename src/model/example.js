const pool = require('../config/db');

const selectAllExamples = (searchParam, sortBy, sort, limit, offset) => {
    return pool.query(`SELECT examples.*, COUNT(liked_examples.id_example) 
        AS "like_count" FROM liked_examples 
        RIGHT JOIN examples ON liked_examples.id_example = examples.id 
        WHERE title ILIKE '%${searchParam}%' GROUP BY examples.id 
        ORDER BY ${sortBy} ${sort} LIMIT ${limit} OFFSET ${offset}`);
}

const selectExample = (id) => {
    return new Promise((resolve, reject) =>
        pool.query(`select * from examples where id='${id}'`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

const insertExample = (data) => {
    const { id, example } = data;
    return pool.query(`INSERT INTO examples VALUES('${id}', '${example})`);
}

const updateExample = (data) => {
    const { id, example } = data;
    return pool.query(`UPDATE examples SET example='${example}' WHERE id='${id}'`);
}

const deleteExample = (id) => {
    return pool.query(`DELETE FROM examples WHERE id='${id}'`);
}

const countData = () => {
    return new Promise((resolve, reject) =>
        pool.query(`select count(*) from examples`,
            (error, result) => (!error) ? resolve(result) : reject(error)));
}

module.exports = {
    selectAllExamples,
    selectExample,
    insertExample,
    updateExample,
    deleteExample,
    countData
}