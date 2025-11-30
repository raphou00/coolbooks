import bucket from "./s3";
import lambda from "./lambda";
import rateLimit from "./dynamodb";

const { files, cloudfront } = bucket();
const bookCreator = lambda(files.bucket);
const rateLimits = rateLimit();

export const bookCreatorArn = bookCreator.invokeArn;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
export const rateLimitsName = rateLimits.name;
