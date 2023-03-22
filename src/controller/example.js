const { v4: uuidv4 } = require('uuid');
const { uploadPhoto, updatePhoto, deletePhoto } = require('../config/googleDrive.config.js');

const commonHelper = require('../helper/common.js');
const commentModel = require('../model/comment.js');
const exampleModel = require('../model/example.js');
const videoModel = require('../model/video.js');


const getAllExamples = async (req, res) => {
    try {
        //Search and pagination query
        const searchParam = req.query.search || '';
        const sortBy = req.query.sortBy || 'updated_at';
        const sort = req.query.sort || 'desc';
        const limit = Number(req.query.limit) || 6;
        const page = Number(req.query.page) || 1;
        const offset = (page - 1) * limit;

        //Get all examples from database
        const results = await exampleModel
            .selectAllExamples(searchParam, sortBy, sort, limit, offset);

        //Return not found if there's no example in database
        if (!results.rows[0]) return commonHelper
            .response(res, null, 404, "Examples not found");

        //Pagination info
        const { rows: [count] } = await exampleModel.countData();
        const totalData = Number(count.count);
        const totalPage = Math.ceil(totalData / limit);
        const pagination = { currentPage: page, limit, totalData, totalPage };

        //Return if page params more than total page
        if (page > totalPage) return commonHelper
            .response(res, null, 404, "Page invalid", pagination);

        //Response
        commonHelper.response(res, results.rows, 200,
            "Get all examples successful", pagination);
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting examples");
    }
}

const getDetailExample = async (req, res) => {
    try {
        //Get request example id
        const id = req.params.id;

        //Get example by id from database
        const result = await exampleModel.selectExample(id);

        //Return not found if there's no example in database
        if (!result.rowCount) return commonHelper
            .response(res, null, 404, "Example not found");

        //Get example videos from database
        const resultVideos = await videoModel.selectExampleVideos(id);
        result.rows[0].videos = resultVideos.rows;

        //Get example comments from database
        const resultComments = await commentModel.selectExampleComments(id);
        result.rows[0].comments = resultComments.rows;

        //Response
        //Both example videos and comments will return empty array
        //If there's no example videos or comments in database
        commonHelper.response(res, result.rows, 200,
            "Get detail example successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting detail example");
    }
}

const createExample = async (req, res) => {
    try {
        //Get request example data and example title
        const data = req.body;
        const title = data.title;

        //Check if example title already exists
        const exampleTitleResult = await exampleModel.selectExampleTitle(title);
        if (exampleTitleResult.rowCount > 0) return commonHelper
            .response(res, null, 403, "Example title already exists");

        //Get example photo
        if (req.file == undefined) return commonHelper
            .response(res, null, 400, "Please input photo");
        // const HOST = process.env.RAILWAY_STATIC_URL;
        // data.photo = `http://${HOST}/img/${req.file.filename}`;
        const uploadResult = await uploadPhoto(req.file)
        const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
        data.photo = parentPath.concat(uploadResult.id)

        //Insert example to database
        data.id = uuidv4();
        data.id_user = req.payload.id;
        data.created_at = Date.now();
        data.updated_at = Date.now();
        const result = await exampleModel.insertExample(data);

        //Response
        commonHelper.response(res, [{ id: data.id }], 201, "Example added");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed adding example");
    }
}

const updateExample = async (req, res) => {
    try {
        //Get request example id, user id, and example data
        const id = req.params.id;
        const id_user = req.payload.id;
        const data = req.body;

        //Check if example exists in database
        const exampleResult = await exampleModel.selectExample(id);
        if (!exampleResult.rowCount)
            return commonHelper.response(res, null, 404, "Example not found");

        //Check if example is created by user logged in
        if (exampleResult.rows[0].id_user != id_user)
            return commonHelper.response(res, null, 403,
                "Updating example created by other user is not allowed");


        try {
            const oldPhoto = exampleResult.rows[0].photo;
            const oldPhotoId = oldPhoto.split("=")[1];
            const updateResult = await updatePhoto(req.file, oldPhotoId)
            const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
            data.photo = parentPath.concat(updateResult.id)
        }
        catch (err) {
            data.photo = exampleResult.rows[0].photo
        }
        //Get example photo
        // if (req.file == undefined) return commonHelper
        //     .response(res, null, 400, "Please input photo");

        //Update example in database
        data.id = id;
        data.updated_at = Date.now();
        const result = await exampleModel.updateExample(data);

        //Response
        commonHelper.response(res, [{ id: data.id }], 201, "Example updated");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed updating example");
    }
}

const deleteExample = async (req, res) => {
    try {
        //Get request example id
        const id = req.params.id;
        const id_user = req.payload.id;

        //Check if example exists in database
        const exampleResult = await exampleModel.selectExample(id);
        if (!exampleResult.rowCount)
            return commonHelper.response(res, null, 404,
                "Example not found or already deleted");

        //Check if example is created by user logged in
        if (exampleResult.rows[0].id_user != id_user)
            return commonHelper.response(res, null, 403,
                "Deleting example created by other user is not allowed");

        
        //Delete example
        const result = await exampleModel.deleteExample(id);

        const oldPhoto = exampleResult.rows[0].photo;
        const oldPhotoId = oldPhoto.split("=")[1];
        await deletePhoto(oldPhotoId)

        //Response
        commonHelper.response(res, result.rows, 200, "Example deleted");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed deleting example");
    }
}

module.exports = {
    getAllExamples,
    getDetailExample,
    createExample,
    updateExample,
    deleteExample
}