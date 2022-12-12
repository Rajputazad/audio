const express = require('express');
const trackRoute = express.Router();
const multer = require('multer');
const app = express();
const { stat, createReadStream } = require("fs");
const { promisify } = require("util");
const { pipeline } = require("stream");
const fileInfo = promisify(stat);
const sampleaudio = "./main.mp3";



app.get('/',async (req, res) => {
 const { size } = await fileInfo(sampleaudio)
    const range = req.headers.range;
console.log(size)
if (range) {
    /** Extracting Start and End value from Range Header */
    let [start, end] = range.replace(/bytes=/, "").split("-");
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size - 1;

    if (!isNaN(start) && isNaN(end)) {
      start = start;
      end = size - 1;
    }
    if (isNaN(start) && !isNaN(end)) {
      start = size - end;
      end = size - 1;
    }

    // Handle unavailable range request
    if (start >= size || end >= size) {
      // Return the 416 Range Not Satisfiable.
      res.writeHead(416, {
        "Content-Range": `bytes */${size}`
      });
      return res.end();
    }

    /** Sending Partial Content With HTTP Code 206 */
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "audio/mp3"
    });

    let readable = createReadStream(sampleaudio, { start: start, end: end });
    pipeline(readable, res, err => {
      console.log(err);
    });

  } else {

    res.writeHead(200, {
      "Content-Length": size,
      "Content-Type": "audio/mp3"
    });

    let readable = createReadStream(sampleaudio);
    pipeline(readable, res, err => {
      console.log(err);
    });

  }
});

app.listen(3001,()=>console.log("done"))
