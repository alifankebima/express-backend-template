require("dotenv").config();
const mainRouter = require("./src/router/index");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const xss = require("xss-clean");
const app = express();
const commonHelper = require("./src/helper/common");

app.use(express.json());
app.use(cors({
    methods: ["GET","PUT","POST","DELETE"]
}));
app.use(morgan("dev"));
app.use(helmet());
app.use(xss());
app.use("/img", express.static("src/upload"));

const port = process.env.PORT || 443;

app.use("/", mainRouter);
app.all("*", (req, res, next) => {
    next(commonHelper.response(res, null, 404, "URL not Found"));
});

app.use((err, req, res, next) => {
    const messageError = err.message || "Internal server error";
    const statusCode = err.status || 500;
    
    //Fix multer file too large message to common helper response
    if(messageError == "File too large"){
        commonHelper.response(res, null, 413, "File too large (Max. 2MB)");
    } else {
        commonHelper.response(res, null, statusCode, messageError);
    }
})

app.listen(port, () => {
    console.log(`Server internal port: ${port}`);
    console.log(`Server url: ${process.env.RAILWAY_STATIC_URL}`)
});