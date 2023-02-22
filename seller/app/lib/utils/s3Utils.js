import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { mergedEnvironmentConfig } from '../../config/env.config.js';
const version = mergedEnvironmentConfig.s3.version;
const region = mergedEnvironmentConfig.s3.region;
const bucket = mergedEnvironmentConfig.s3.bucket;

//TODO:move to ext config
const s3 = new AWS.S3({
    useAccelerateEndpoint: true,
    region: region
});

const signedUrlExpireSeconds = 60 * 60*60;

const myBucket = bucket;

const getSignedUrlForUpload = (s3,myBucket) => async(data) => {

    //TODO: Use Axios to send http request
    try {

        console.log('data-------myBucket-----region-',myBucket);
        console.log('data-------myBucket-----version-',version);

        console.log('data-------------',data);
        console.log('data-------myBucket------',myBucket);
        // console.log("data-------myBucket-----s3-",s3);

        const myKey = data.path+'/' + uuidv4() + data?.fileType?.replace(/^\.?/, '.');
        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };

        console.log('params------------->',params);

        return await new Promise(
            (resolve, reject) =>

                s3.getSignedUrl('putObject', params, function (err, url) {
                    console.log('[getSignedUrlForUpload] Error getting presigned url from AWS S3',err);
                    if (err) {
                        console.log('[getSignedUrlForUpload] Error getting presigned url from AWS S3');
                        reject( {success: false, message: 'Pre-Signed URL error', urls: url});
                    } else {
                        console.log('Presigned URL: ', url);
                        resolve( {
                            success: true,
                            message: 'AWS SDK S3 Pre-signed urls generated successfully.',
                            path: myKey,
                            urls: url
                        });
                    }
                }));

        console.log('params---------signedUrl---->');
        //
        // return signedUrl;
    } catch (err) {
        console.log('params---------err---->',err);

        return err;
    }
};

exports.getSignedUrlForUpload = getSignedUrlForUpload(s3,myBucket);

exports.getSignedUrlForRead = async(data) => {
    //TODO: Use Axios to send http request
    try {
        console.log('data-------------',data);

        let myKey = data.path;

        const params = {
            Bucket: myBucket,
            Key: myKey,
            Expires: signedUrlExpireSeconds
        };
        return await new Promise(
            (resolve, reject) => s3.getSignedUrl('getObject', params, function (err, url) {
                if (err) {
                    // console.log('Error getting presigned url from AWS S3');
                    reject({success: false, message: 'Pre-Signed URL erro', urls: url});
                } else {
                    // console.log('Presigned URL: ', url);
                    resolve({ url: url, path: data.path });
                }
            }));
    } catch (err) {
        return err;
    }
};

exports.getFileAsStream = async(data) => {
    //TODO: Use Axios to send http request
    // promisify read stream from s3
    function getBufferFromS3Promise(file) {
        return new Promise((resolve, reject) => {
            getBufferFromS3(file, (error, s3buffer) => {
                if (error) return reject(error);
                return resolve(s3buffer);
            });
        });
    }

    // Get buffered file from s3
    function getBufferFromS3(file, callback) {
        let myKey = file;
        const buffers = [];
        var options = {
            Bucket: myBucket,
            Key: myKey,
        };
        const stream = s3.getObject(options).createReadStream();
        stream.on('data', data => buffers.push(data));
        stream.on('end', () => callback(null, Buffer.concat(buffers)));
        stream.on('error', error => callback(error));
    }
    try {
        const myKey = data.path;
        const buffer = await getBufferFromS3Promise(myKey);
        return buffer;
    } catch (err) {
        return err;
    }
};
