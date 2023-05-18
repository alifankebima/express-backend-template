const response = (res, result, status, message, pagination) => {
    const resultPrint = {};
    if (status >= 200 && status <= 299) {
        resultPrint.status = "success";
    } else {
        resultPrint.status = "failed";
    }
    resultPrint.statusCode = status;
    resultPrint.data = result || null;
    resultPrint.message = message || null;
    resultPrint.pagination = pagination || null;
    res.status(status).json(resultPrint);
}

module.exports = { 
    response 
}