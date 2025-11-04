import bucket from "./s3";
import lambda from "./lambda";

const { files, cloudfront } = bucket();
const bookCreator = lambda(files.bucket);

export const bookCreatorArn = bookCreator.invokeArn;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
