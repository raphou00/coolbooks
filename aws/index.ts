import db from "./rds";
import bucket from "./s3";
import lambda from "./lambda";

const { rds } = db();
const { files, cloudfront } = bucket();
const bookCreator = lambda(files.bucket);

export const bookCreatorArn = bookCreator.invokeArn;
export const dbEndpoint = rds.endpoint;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
