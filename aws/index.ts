import db from "./rds/db";
import bucket from "./s3/bucket";

const rds = db();
const { files, cloudfront } = bucket();

export const dbEndpoint = rds.endpoint;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
