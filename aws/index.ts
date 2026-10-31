import filesBucket from "./s3";
import bookCreatorFunction from "./lambda";
import rateLimitTable from "./dynamodb";
import dataTable from "./dynamodb/data";

const { files, cloudfront } = filesBucket();
const data = dataTable();
const bookCreator = bookCreatorFunction(files.bucket, data);
const rateLimits = rateLimitTable();

export const bookCreatorArn = bookCreator.invokeArn;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
export const rateLimitsName = rateLimits.name;
export const dataTableName = data.name;
